# Changesets

每个会影响发布内容的 PR 都应该带一个 changeset。

创建方式：

```bash
bun run changeset
```

然后选择这次改动对应的版本级别：

- `patch`: 修复、微调、向后兼容的小改动
- `minor`: 新功能，向后兼容
- `major`: 破坏性变更
