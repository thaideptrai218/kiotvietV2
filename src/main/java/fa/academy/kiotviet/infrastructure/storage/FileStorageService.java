package fa.academy.kiotviet.infrastructure.storage;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

@Service
@Slf4j
public class FileStorageService {

    private static final long MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB
    private static final String UPLOADS_PREFIX = "/uploads";

    private final Path rootLocation;
    private final String publicBaseUrl;

    public FileStorageService(
            @Value("${app.storage.upload-dir:uploads}") String uploadDir,
            @Value("${app.storage.public-base-url:}") String publicBaseUrl) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl == null ? "" : publicBaseUrl.trim();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize upload directory", e);
        }
    }

    public String storeCompanyLogo(Long companyId, MultipartFile file) {
        validateLogo(file);

        Path companyDir = rootLocation.resolve("company").resolve(String.valueOf(companyId));
        try {
            Files.createDirectories(companyDir);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create directory for company logo", e);
        }

        Path target = companyDir.resolve("logo.png");
        try {
            BufferedImage image;
            try (InputStream inputStream = file.getInputStream()) {
                image = ImageIO.read(inputStream);
            }
            if (image == null) {
                throw new IllegalArgumentException("Invalid image file");
            }
            try (OutputStream outputStream = Files.newOutputStream(
                    target,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING,
                    StandardOpenOption.WRITE)) {
                ImageIO.write(image, "png", outputStream);
            }
        } catch (IOException e) {
            log.error("Failed to store company logo for id {}", companyId, e);
            throw new IllegalStateException("Failed to store company logo", e);
        }

        return buildPublicUrl(companyId);
    }

    private void validateLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Logo file is required");
        }
        if (file.getSize() > MAX_LOGO_SIZE) {
            throw new IllegalArgumentException("Logo file must be 2 MB or smaller");
        }
        String contentType = file.getContentType();
        if (contentType != null) {
            contentType = contentType.toLowerCase();
        }
        boolean supportedType = contentType != null &&
                (contentType.equals("image/png") || contentType.equals("image/jpeg") || contentType.equals("image/jpg"));
        if (!supportedType && !hasSupportedExtension(file.getOriginalFilename())) {
            throw new IllegalArgumentException("Only PNG or JPG images are allowed");
        }
    }

    private boolean hasSupportedExtension(String filename) {
        if (filename == null) {
            return false;
        }
        String lower = filename.toLowerCase();
        return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg");
    }

    private String buildPublicUrl(Long companyId) {
        String relativePath = UPLOADS_PREFIX + "/company/" + companyId + "/logo.png";
        if (publicBaseUrl.isBlank()) {
            return relativePath;
        }
        String base = stripTrailingSlashes(publicBaseUrl);
        if (base.endsWith(UPLOADS_PREFIX)) {
            return base + relativePath.substring(UPLOADS_PREFIX.length());
        }
        return base + relativePath;
    }

    private String stripTrailingSlashes(String value) {
        String result = value.trim();
        while (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }
}
