import React from 'react';
import PropTypes from 'prop-types';
import { Destination } from '@/services/destination';
import DynamicForm from '@/components/dynamic-form/DynamicForm';
import helper from '@/components/dynamic-form/dynamicFormHelper';

export default function EditDestinationForm({ destination, type, onSuccess, ...props }) {
  const selectedType = type.type;
  const fields = helper.getFields(type.configuration_schema, destination);

  const handleSubmit = (values, successCallback, errorCallback) => {
    helper.updateTargetWithValues(destination, values);
    destination.$save(
      (data) => {
        successCallback('Saved.');
        onSuccess(data);
      },
      (error) => {
        if (error.status === 400 && 'message' in error.data) {
          errorCallback(error.data.message);
        } else {
          errorCallback('Failed saving.');
        }
      },
    );
  };

  return (
    <div>
      <div className="text-center">
        <img src={`${Destination.IMG_ROOT}/${selectedType}.png`} alt={type.name} width="64" />
        <h3>{type.name}</h3>
      </div>
      <div className="col-md-4 col-md-offset-4">
        <DynamicForm {...props} fields={fields} onSubmit={handleSubmit} feedbackIcons />
      </div>
    </div>
  );
}

EditDestinationForm.propTypes = {
  destination: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  type: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onSuccess: PropTypes.func,
};

EditDestinationForm.defaultProps = {
  onSuccess: () => {},
};
