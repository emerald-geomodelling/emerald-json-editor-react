# emerald-json-editor-react

Wrapper around [json-editor](https://github.com/json-editor/json-editor) and react.

## Install

```
npm install emerald-json-editor-react
```

## Requirements

Json Editor with CDN:

```
<script src="https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/dist/jsoneditor.min.js"></script>
```

Visit [json-editor documentation](https://github.com/json-editor/json-editor) for newest doumentation on the package.

## Usage

Example project: https://github.com/emerald-geomodelling/emerald-json-editor-react-example

### Initialize

```javascript
import {
  JsonEditorWrapper,
  registerJsonEditorField,
} from "emerald-json-editor-react";
```

### Optional

The importFile prop is an optional function for file upload handling. This is an example of the function using axios:

```javascript
export const importFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return client.post(`/api/file/new`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
```

The onValidationStatusChange prop is an optional function that is used to update local states, for example:

```javascript
const [isDataValid, setIsDataValid] = useState(false);

const onValidationStatusChange = (status) => {
  setIsDataValid(status);
};

<JsonEditorWrapper onValidationStatusChange={onValidationStatusChange}>
```
