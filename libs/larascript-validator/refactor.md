## Refactor Notes

- Keep AbstractDatabaseRule

- AbstractRule needs another wrapper e.g. AbstractRuleHttpAware or something similar
- Same for BaseCustomValidator

- BaseCustomValidator.validate should have a validator passed into it, with httpContext set 

- Deleted following database rules:
- ExistsRule
- FileExtensionRule
- FileMimeTypeRule
- HasFileRule
- MaxFileSizeRule
- MultipleFilesRule
- SingleFileRule
- UniqueRule