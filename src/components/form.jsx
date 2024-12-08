import React from 'react';
import Fields from './fields/index.jsx';
import {Label} from './ui/label.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip.jsx';

/**
 * Form Component
 *
 * @param {Object} props
 * @param {Object} props.schema - The schema object containing only the field definitions to be rendered
 * @param {Object} props.formData - The current form data
 * @param {Function} props.handleChange - Function to handle field value changes
 * @param {React.ReactNode} props.children - Additional content to be rendered inside the form (e.g., buttons)
 *
 * @example
 * <Form
 *   schema={{
 *     field1: { friendlyName: 'Field 1', fieldType: 'string' },
 *     field2: { friendlyName: 'Field 2', fieldType: 'number' }
 *   }}
 *   formData={{ field1: 'value1', field2: 42 }}
 *   handleChange={(fieldName, newValue) => {}}
 * >
 *   <button type="submit">Submit</button>
 * </Form>
 */
export default function Form({
  schema,
  formData,
  handleChange,
  children,
  newRecord,
  recordId,
  record,
}) {
  const renderInputField = (columnId, settings) => {
    let Field = Fields.string.edit;

    let value = formData[columnId];
    let valueFriendly = value;

    if (settings.join) {
      valueFriendly =
        formData[columnId + '_' + settings.friendlyColumnName] || value;
    }

    if (settings.readOnly && !(newRecord && settings.createAllowed)) {
      if (Fields[settings.fieldType]?.read) {
        Field = Fields[settings.fieldType].read;
      } else {
        Field = Fields.string.read;
      }
    } else if (settings.join) {
      Field = Fields.reference.edit;
    } else if (Fields[settings.fieldType]?.edit) {
      Field = Fields[settings.fieldType].edit;
    }

    return (
      <Field
        columnId={columnId}
        settings={settings}
        value={value}
        valueFriendly={valueFriendly}
        handleChange={handleChange}
        recordId={recordId}
        formData={formData}
        record={record}
      />
    );
  };

  return (
    <>
      <TooltipProvider>
        {/* <Tooltip target=".tooltip" /> */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-2 w-full mt-4"
          style={{maxWidth: '1000px'}}
        >
          {Object.entries(schema || {}).map(([columnId, settings]) => (
            <div
              className="flex items-center justify-center space-x-4"
              key={columnId}
            >
              <div className="w-[150px] text-right shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor={columnId} className="">
                      {settings.friendlyName || columnId}
                      {settings.required && (
                        <span className="text-danger"> *</span>
                      )}
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {(settings.helpText ? settings.helpText : '') +
                        (settings.required ? ' This field is required.' : '')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex-grow flex items-center space-x-1">
                {renderInputField(columnId, settings)}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-center space-x-4">
            <div className="w-[150px] text-right shrink-0"> </div>
            <div className="flex-grow flex items-center space-x-2">
              {children}
            </div>
          </div>
        </form>
      </TooltipProvider>
    </>
  );
}
