class UploadField extends window.JSONEditor.defaults.editors.upload {
  constructor(options, defaults) {
    super(
      {
        ...options,
        schema: {
          ...options.schema,
          options: {
            ...options.schema?.options,
            upload: {
              ...options.schema?.options?.upload,
              upload_handler: "defaultUploadHandler",
            },
          },
          links: [{ href: "{{self}}" }],
        },
      },
      defaults
    );
  }
}

var name = crypto.randomUUID();

window.JSONEditor.defaults.resolvers.unshift((schema) => {
  if (schema.format !== "url") return undefined;
  if (schema.options?.upload?.upload_handler !== undefined) return undefined;
  return name;
});
window.JSONEditor.defaults.editors[name] = UploadField;
