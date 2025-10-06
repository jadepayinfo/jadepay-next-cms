import { NextPage } from 'next';
import withAuth from '@/hoc/with_auth';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth_context';
import axios from 'axios';
import { AccessType } from '@/model/staff_info';

interface Props {}
const HomePage: NextPage<Props> = (props) => {
  const router = useRouter();
  const initPage = useRef<boolean>(false);

  const { setStaff } = useAuth();

  useEffect(() => {
    const getLoadData = async () => {
      try {
        initPage.current = true;

        const info = await axios.get(`/api/staff/info`);
        setStaff(info.data);

        const menu: AccessType[] = info.data?.role?.access ?? [];
        const checkaAccessDashboard = menu.find(
          (item) => item.menu_name === 'dashboard'
        );

        if (checkaAccessDashboard) {
          router.replace('/dashboard');
        } else {
          router.replace('/user/ownerprofile');
        }
        
      } catch (err: any) {
      } finally {
      }
    };

    if (!initPage.current) {
      getLoadData();
    }
  }, [router]);

  return (
    <>
      <div>Loading Page</div>
    </>
  );
};

export const getServerSideProps = async (ctx: any) => {
  return {
    props: {}
  };
};

export default withAuth(HomePage);
