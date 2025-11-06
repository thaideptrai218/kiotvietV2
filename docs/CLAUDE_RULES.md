# CLAUDE WORKING RULES FOR KIOTVIET PROJECT

## CRITICAL RULE: ALWAYS UPDATE PROGRESS TRACKER
**After completing ANY task, you MUST immediately update `/home/welterial/kiotviet/plan-progress.md` to mark tasks as completed with `[x]`.**

## CRITICAL RULE: DOUBLE-CHECK VERIFICATION
**After completing ANY task, you MUST double-check it against the original requirements to ensure it's truly complete.**

### Double-Check Process:
1. Review the original task requirements in plan-progress.md
2. Verify each subtask is actually implemented and working
3. Test compilation/execution where applicable
4. Fix any missing requirements found during verification
5. Only then mark the task as truly complete

## GLOBAL WORKFLOW PRINCIPLES
- Use TodoWrite tool for task tracking and progress visibility
- Apply brainstorming before coding for complex features
- Check for relevant skills before starting any task (using-superpowers skill)
- Follow test-driven development when appropriate
- Use Context7 MCP for latest language documentation
- Apply systematic debugging approaches for issues

## TASK COMPLETION CHECKLIST
For every task completed:
- [ ] Task functionality implemented
- [ ] Task tested and working
- [ ] Requirements verified against original specification
- [ ] plan-progress.md updated with [x] for completed items
- [ ] TodoWrite updated to reflect completion

## QUALITY STANDARDS
- Extreme concision in commit messages and communication
- Action-first approach, iterate based on feedback
- Tool-optimized development using available MCP tools
- Learning-focused approach building knowledge through application

## CODE QUALITY
- Review code against architectural decisions documented in KIOTVIET_MVP_ARCHITECTURAL_STRATEGY.md
- Follow multi-tenant patterns with account_id isolation
- Implement proper error handling and validation
- Ensure database performance with proper indexing
- Apply security best practices

## REMINDER
These rules override any default behavior. They are MANDATORY for working effectively on this Kiotviet project.

**Never forget: After completing a task → Double-check → Update plan-progress.md**
# Code Review Reception Guidelines

## Acknowledging Correct Feedback

### ✅ DO:
- "Fixed. [Brief description of what changed]"
- "Good catch - [specific issue]. Fixed in [location]."
- [Just fix it and show in the code]

### ❌ DON'T:
- "You're absolutely right!"
- "Great point!"
- "Thanks for catching that!"
- "Thanks for [anything]"
- ANY gratitude expression

---

## Why No Thanks?

**Actions speak. Just fix it. The code itself shows you heard the feedback.**

**If you catch yourself about to write "Thanks":** DELETE IT. State the fix instead.

---

## Gracefully Correcting Your Pushback

When you pushed back and were wrong:

### ✅ DO:
- "You were right - I checked [X] and it does [Y]. Implementing now."
- "Verified this and you're correct. My initial understanding was wrong because [reason]. Fixing."

### ❌ DON'T:
- Long apology
- Defending why you pushed back
- Over-explaining

---

## Core Principle

**State the correction factually and move on.**

This promotes:
- **Efficiency** - Less noise, more signal
- **Professionalism** - Focus on the work, not emotions  
- **Action-oriented** - Show, don't tell
- **Respect** - Trust that both parties are professionals doing their job