import React from "react";
import JSONEditor from "json-editor";

export const JsonEditorField = (Component) => {
  class editorField extends JSONEditor.AbstractEditor {
    setValue(value, initial) {
      if (this.getValue() === value) return;

      this.value = value;
      this.onChange(value);
      this.rerender();
    }

    getNumColumns() {
      return 12;
    }

    build() {
      this.idstr = crypto.randomUUID();

      if (!this.parent.options.table_row) {
        this.label = this.header = this.theme.getCheckboxLabel(
          this.getTitle(),
          this.isRequired()
        );
        this.label.htmlFor = this.formname;
      }

      if (this.schema.description)
        this.description = this.theme.getFormInputDescription(
          this.translateProperty(this.schema.description)
        );
      if (this.options.infoText && !this.options.compact)
        this.infoButton = this.theme.getInfoButton(
          this.translateProperty(this.options.infoText)
        );
      if (this.options.compact) this.container.classList.add("compact");

      this.input = document.createElement("div");
      this.control = this.theme.getFormControl(
        this.label,
        this.input,
        this.description,
        this.infoButton
      );
      this.container.appendChild(this.control);
      this.rerender();
    }

    rerender() {
      const fields = { ...this.jsoneditor.react_fields.fields };
      const ComponentName = Component;
      fields[this.idstr] = {
        domNode: this.input,
        children: (
          <ComponentName
            schema={this.schema}
            value={this.value}
            setValue={this.setValue.bind(this)}
            disabled={this.disabled}
            always_disabled={this.always_disabled}
            context={this.jsoneditor.context}
          />
        ),
      };
      this.jsoneditor.react_fields.setFields(fields);
    }

    enable() {
      if (!this.always_disabled) {
        this.disabled = false;
        this.rerender();
        super.enable();
      }
    }

    disable(alwaysDisabled) {
      if (alwaysDisabled) this.always_disabled = true;
      this.disabled = true;
      this.rerender();
      super.disable();
    }

    destroy() {
      if (this.input && this.input.parentNode) {
        this.input.parentNode.removeChild(this.input);
        const fields = { ...this.jsoneditor.react_fields.fields };
        delete fields[this.idstr];
        this.jsoneditor.react_fields.setFields(fields);
      }
      super.destroy();
    }

    showValidationErrors(errors) {
      this.previous_error_setting = this.jsoneditor.options.show_errors;

      const addMessage = (messages, error) => {
        if (error.path === this.path) {
          messages.push(error.message);
        }
        return messages;
      };
      const messages = errors.reduce(addMessage, []);

      if (messages.length) {
        this.theme.addInputError(this.input, `${messages.join(". ")}.`);
      } else {
        this.theme.removeInputError(this.input);
      }
    }
  }

  return editorField;
};

const registerJsonEditorField = (resolver, Component, name) => {
  name = name || crypto.randomUUID();

  JSONEditor.defaults.resolvers.unshift((schema) => {
    if (resolver(schema)) return name;
  });
  JSONEditor.defaults.editors[name] = JsonEditorField(Component);
};

export default registerJsonEditorField;
