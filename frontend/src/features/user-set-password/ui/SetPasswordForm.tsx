import Form from "next/form";
import {setPasswordAction} from "@/features/user-set-password";


interface SetPasswordFormProps {
    token: string;
    error?: string;
}

export const SetPasswordForm = async ({token, error}: SetPasswordFormProps) => {
    const action = setPasswordAction.bind(null, token)

    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <Form action={action} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div>
                    <input name='password' type='password' placeholder='Password' required/>
                </div>

                <div>
                    <input name='confirmPassword' type='password' placeholder='Confirm Password' required/>
                </div>

                <button type='submit'>ACTIVATE</button>
            </Form>
            {error && (
                <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>
            )}
        </div>
    )
}
