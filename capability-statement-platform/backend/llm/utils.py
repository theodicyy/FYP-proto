def get_by_path(obj, path: str):
    """
    Resolve dot-path like 'data.client.name' inside nested dicts.
    """
    parts = path.split(".")
    cur = obj
    for p in parts:
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            raise KeyError(f"Path not found: {path} (failed at '{p}')")
    return cur


def to_text(value):
    """
    Convert JSON value to text for summarization.
    - strings -> unchanged
    - lists -> joined with newlines
    - other -> str(...)
    """
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "\n".join(str(x) for x in value if x is not None)
    return str(value)
