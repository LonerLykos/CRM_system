import {loginAction} from "@/server-actions/loginAction";
import Form from "next/form";


export default function Login() {
  return (
    <div>
      <h1>Sign in</h1>
      <Form action={loginAction}>
        <div className="wrap-input">
          <label>
            <input name="email" type="text" placeholder="example@mail.com" required />
          </label>
        </div>

        <div className="wrap-input">
          <label>
            <input name="password" type="password" placeholder="Enter your password" required />
          </label>
        </div>

        <button type="submit">Sign in</button>
      </Form>
    </div>
  );
}
