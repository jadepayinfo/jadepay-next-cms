import {
  COMPANY_ADMIN,
  COMPANY_PLATFORM_ADMIN,
  COMPANY_PLATFORM_STAFF,
  ROOT,
  TOKEN_APP
} from '@/lib/constant';
import { StaffInfoType } from '@/model/staff_info';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState
} from 'react';

type AuthContextInitialState = {
  token: string;
  staff?: StaffInfoType;
  setStaff: Dispatch<SetStateAction<StaffInfoType | undefined>>;
  setToken: Dispatch<SetStateAction<string>>;
  isAuthenticated: Boolean;
  logout: Function;
  getMyLevelControl: (level: string | undefined) => string[] | undefined;
  removeCookiesAuth: Function;
};

const AuthContext = createContext<AuthContextInitialState | null>(null);

export default function AuthProvider(props: { children: ReactNode }) {
  const router = useRouter();

  const { children } = props;

  const tokenAPP = Cookies.get(TOKEN_APP) as string;

  const [staff, setStaff] = useState<StaffInfoType>();
  const [token, setToken] = useState<string>(tokenAPP);

  const removeCookiesAuth: Function = useCallback(() => {
    Cookies.remove(TOKEN_APP, { sameSite: 'lax' });
  }, []);

  const logout = async () => {
    try {
      Cookies.remove(TOKEN_APP, { sameSite: 'lax' });
      setToken('');
      router.replace('/login');
    } catch (error) {
      // throw new Error("This hook must be called within 'AuthContext'");
    }
  };

  const getMyLevelControl = (level: string | undefined) => {
    const levelUser = level ?? '';

    let RawLevelData = [
      {
        value: ROOT,
        key: 1
      },
      {
        value: COMPANY_ADMIN,
        key: 2
      },
      {
        value: COMPANY_PLATFORM_ADMIN,
        key: 3
      },
      {
        value: COMPANY_PLATFORM_STAFF,
        key: 4
      }
    ];

    let levelProcress: any = [];

    if (levelUser === ROOT) {
      RawLevelData = RawLevelData.filter((level) => level.value !== ROOT);
      levelProcress = RawLevelData;
    } else {
      const findLevel = RawLevelData.find((level) => level.value === levelUser);
      levelProcress = RawLevelData.filter((role) => role.key >= findLevel!.key);
    }

    return levelProcress?.map((role: any) => role.value) as string[];
  };

  const value: AuthContextInitialState = {
    staff,
    setStaff,
    token,
    isAuthenticated: !!tokenAPP,
    setToken,
    logout,
    getMyLevelControl,
    removeCookiesAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const authContext = useContext(AuthContext);

  if (!authContext)
    throw new Error("This hook must be called within 'AuthContext'");

  return authContext;
}
