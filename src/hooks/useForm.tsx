import { useState } from "react";
import { object } from "yup";

export const useForm = (schema: any = object({}), initialValues: any = {}) => {
  const [values, setValues] = useState<any>(initialValues);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  const handleChange = (e: React.FormEvent): void => {
    const target = e.target as HTMLInputElement;
    const valueChanged: Record<string, string> = {
      [target.name]: target.value,
    };
    setValues((values: any) => ({ ...values, ...valueChanged }));
    setHasChanged(true);
  };

  function validate() {
    return schema.validate(values);
  }

  function setFieldValue(fieldName: string, value: any) {
    setValues((values: any) => ({ ...values, [fieldName]: value }));
    setHasChanged(true);
  }

  function submit(callback?: (values: any) => Promise<any>) {
    setSubmitting(true);
    return validate()
      .catch((error: any) => {
        setSubmitting(false);
        return Promise.reject({
          message: error.message,
        });
      })
      .then(() => {
        if (callback != undefined) {
          return callback(values)
            .then((res) => {
              setSubmitting(false);
              return Promise.resolve(res);
            })
            .catch((error) => {
              setSubmitting(false);
              return Promise.reject(error);
            });
        } else {
          setSubmitting(false);
          return Promise.resolve(values);
        }
      });
  }

  function reset() {
    setValues((values: any) => ({
      ...Object.fromEntries(Object.keys(values).map((item) => [item, ""])),
    }));
    setHasChanged(true);
  }

  function empty() {
    setHasChanged(false);
    setValues((values: any) => ({}));
  }

  return {
    values,
    setValues,
    setFieldValue,
    submit,
    handleChange,
    validate,
    reset,
    empty,
    hasChanged,
    submitting,
  };
};
