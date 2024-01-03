import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { JSONEditor } from "json-editor";
import {} from "./JsonEditorFileUpload";

const JsonEditorWrapper = (props) => {
  const {
    schema,
    data,
    setData,
    context,
    onValidationStatusChange,
    importFile,
  } = props;
  props = Object.fromEntries(
    Object.entries(props).filter(
      ([name, value]) =>
        ["schema", "data", "setData", "context"].indexOf(name) < 0
    )
  );
  const containerRef = useRef(null);
  const [editorState, setEditorState] = useState(null);
  const [fields, setFields] = useState({});

  if (props.theme === undefined) props.theme = "html";
  if (props.disable_edit_json === undefined) props.disable_edit_json = true;
  if (props.disable_array_delete_last_row === undefined)
    props.disable_array_delete_last_row = true;
  if (props.disable_array_delete_all_rows === undefined)
    props.disable_array_delete_all_rows = true;
  if (props.disable_properties === undefined) props.disable_properties = true;
  if (props.required_by_default === undefined) props.required_by_default = true;
  if (props.keep_oneof_values === undefined) props.keep_oneof_values = false;

  useEffect(() => {
    if (!containerRef.current || !schema) return;
    const editorNode = document.createElement("div");
    containerRef.current.appendChild(editorNode);

    JSONEditor.defaults.callbacks.upload = {
      defaultUploadHandler: function (jseditor, type, file, cbs) {
        if (!importFile) {
          return;
        }
        const fileName = file.name;
        const fileExtensionPattern = new RegExp(
          jseditor.original_schema.pattern
        );

        // Validate file extension
        if (!fileExtensionPattern.test(fileName)) {
          console.error("Invalid file extension for file:", fileName);
          cbs.failure("Invalid file extension");
          return;
        }

        let isUploading = true;
        let tick = 0;

        importFile(file)
          .then((response) => {
            console.log("Success!", response.data.file);
            isUploading = false;
            cbs.success(response.data.file);
          })
          .catch((error) => {
            isUploading = false;
            console.error("Error uploading file:", error);
          });

        const tickFunction = function () {
          if (!isUploading) return;

          tick += 1;
          console.log("progress: " + tick);
          cbs.updateProgress(tick);

          if (tick < 100) {
            window.setTimeout(tickFunction, 50);
          } else {
            window.setTimeout(tickFunction, 500);
          }
        };

        window.setTimeout(tickFunction);
      },
    };

    const editor = new JSONEditor(editorNode, {
      schema: schema,
      startval: data,
      ...props,
    });
    editor.react_fields = {
      fields,
      setFields: (fields) => {
        editor.react_fields.fields = fields;
        setFields(fields);
      },
    };
    editor.context = context;
    editor.idstr = crypto.randomUUID();
    console.log("CREATE", editor.idstr);
    console.log("CREATE", JSON.stringify(schema));

    const readyFunction = () => {
      console.log("READY", editor.idstr);
      setEditorState(editor);
    };
    const changeFunction = () => {
      console.log("Change detected");
      setData(editor.getValue());

      const validationErrors = editor.validate();
      if (validationErrors.length === 0) {
        console.log("It is valid");
        onValidationStatusChange && onValidationStatusChange(true);
      } else {
        onValidationStatusChange && onValidationStatusChange(false);
        console.log("It is NOT valid");
      }
    };

    editor.on("ready", readyFunction);
    editor.on("change", changeFunction);
    return () => {
      console.log("DELETE", editor.idstr);
      editor.off("ready", readyFunction);
      editor.off("change", changeFunction);
      editor.destroy();
      editor.isDestroyed = true;
      editorNode.remove();
      setEditorState(null);
    };
  }, [JSON.stringify(schema), JSON.stringify(props), containerRef]); // eslint-disable-line

  //console.log(editorState.validate(), "is valid?");

  useEffect(() => {
    if (!editorState || editorState.isDestroyed) return;
    console.log("SET VALUE", editorState.idstr);
    console.log("SET VALUE", JSON.stringify(data));

    console.log("Current Editor Value:", editorState.getValue());

    editorState.setValue(data);
  }, [editorState, JSON.stringify(data)]); // eslint-disable-line

  return (
    <div>
      <div ref={containerRef} />
      {Object.entries(fields).map(([key, field]) =>
        createPortal(field.children, field.domNode, (key = key))
      )}
    </div>
  );
};

export default JsonEditorWrapper;
