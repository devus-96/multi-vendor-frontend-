import { InferType, object, ref, string } from "yup";

export const LoginForm = object({
  email: string().email('email is required'),
  password: string().required("password is required"),
});

export const twoFactorFrom = object({
    
})

export const RegisterForm = object({
  fisrtname: string().required("name is required"),
  lastname: string().required("name is required"),
  email: string().email('email is required'),
  role: string().required("role is required"),
  location: string(),
  phone_number: string().required("phine number is required"),
  password: string().required("password is required"),
  password_confirmation: string()
    .oneOf([ref("password"), ""], "Passwords must match")
    .required("Password confirmation is required"),
});

export type RegisterFormType = InferType<typeof RegisterForm>;
export type LoginFormType = InferType<typeof LoginForm>;