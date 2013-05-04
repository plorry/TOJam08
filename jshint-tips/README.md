# jshint tips

### run it on the command line
```bash
jshint --reporter jshint-reporter.js ./
```
more info http://www.jshint.com/docs/reporter/

### install jshint with node
```bash
npm install -g jshint
```

### install sublimelinter

- setup sublime linter

```json
{
  "sublimelinter_executable_map":
  {
    "perl": "perl",
    "php": "php",
    "ruby": "ruby",
    "javascript": "jshint"
  }
}
```