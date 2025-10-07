import { NextPage } from 'next';
import { FormEventHandler, useState } from 'react';
import { useRouter } from 'next/router';
import { TOKEN_APP } from '@/lib/constant';
import Cookies from 'js-cookie';
import axios from 'axios';
import InputCustom from '@/components/input/input';
import ImageLogin from '@/public/assets/login/img-signin.svg';
import { IconEmail, IconEyeClose, IconEyeOpen } from '@/components/icon';
import { useAuth } from '@/context/auth_context';

interface Props {}
const LoginPage: NextPage<Props> = (props) => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);

  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();

  const submitButtonHandler: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    onLoginHandler();
  };

  const onLoginHandler = async () => {
    setLoading(true);
    setErr('');
    try {
      if (loading) return;
      if (username === '' || password === '') {
        setErr('username and password is required');
        setLoading(false);
        return;
      }

      const response = await axios.post<any>(`/api/login`, {
        username,
        password
      });

      if (response.data.data?.token?.access_token == null) {
        setErr(response.data.status_detail);
        setLoading(false);
        return;
      }
      if (response.data.data?.token?.access_token) {
        const token = response.data.data.token.access_token;
        Cookies.set(TOKEN_APP, token);

        // set user to context
       
        setUser(response.data.data.user_admin);
        router.replace('/customer');
        setLoading(false);

        setLoading(false);
      }
    } catch (error: any) {
      console.log(error);
      setErr(error.response?.data.error ?? 'Internal Server Error');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="content w-screen h-screen">
        <div className="grid grid-cols-12 h-full">         
          <div className="login-bg col-span-12 lg:col-span-6 flex min-h-full flex-1 flex-col items-center justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
                Welcome to Jadepay 
              </h2>
            </div>
            <div className="mt-10 col-span-6 ss:mx-auto ss:w-full ss:max-w-sm">
              <form className="space-y-6" onSubmit={submitButtonHandler}>
                <div className="mt-2">
                  <InputCustom
                    name="username"
                    title="Username"
                    type="text"
                    prefixIcon={<IconEmail className="text-[24px]" />}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="mt-2">
                  <InputCustom
                    name="password"
                    title="Password"
                    type={isShowPassword ? 'text' : 'password'}
                    onChange={(e) => setPassword(e.target.value)}
                    suffixIcon={
                      isShowPassword ? (
                        <IconEyeOpen
                          className="text-[24px] cursor-pointer"
                          onClick={() => setIsShowPassword(!isShowPassword)}
                        />
                      ) : (
                        <IconEyeClose
                          className="text-[24px] cursor-pointer"
                          onClick={() => setIsShowPassword(!isShowPassword)}
                        />
                      )
                    }
                    inputValidation={err !== '' ? 'error' : undefined}
                    helperText={err}
                    autoComplete="off"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-base-200 shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                  >
                    <span>Login</span>
                    {loading && (
                      <span className="ml-1 loading loading-spinner"></span>
                    )}
                  </button>
                </div>
                {/* <p className="text-red-500 my-5 text-center ">{err}</p> */}
              </form>
            </div>
          </div>
           <div className="login-bg hidden lg:block col-span-6">
            <div className="flex justify-center items-center h-full w-4/5">
              <ImageLogin className="bg-login-size w-64 h-auto " />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async (ctx: any) => {
  return {
    props: {}
  };
};

export default LoginPage;
