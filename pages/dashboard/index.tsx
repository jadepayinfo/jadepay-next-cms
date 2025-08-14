import { NextPage } from 'next';
import withAuth from '@/hoc/with_auth';
import { initHeaderWithServerSide } from '@/lib/axios';
import { useAuth } from '@/context/auth_context';
import { useEffect, useRef } from 'react';

interface Props {}
const DashBoardPage: NextPage<Props> = (props) => {
  const { staff } = useAuth();

  const initPage = useRef<boolean>(false);

  useEffect(() => {
    initPage.current = true;
  }, [staff]);

  if (!initPage.current) {
    return (
      <div className="h-full flex justify-center items-center">
        <span className="loading loading-spinner w-[2rem] text-primary"></span>
      </div>
    );
  }

  if (staff?.role.level === 'ROOT') {
    return (
      <>
        <div className="p-4">
          
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-4">
        
      </div>
    </>
  );
};

export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);

  const defaultValue: Props = {
    static_summary: null,
    deal_summary: null
  };

  try {
    return {
      props: {}
    };
  } catch (error: any) {
    console.error('DashBoardPage getServerSideProps error', error);
    return {
      props: defaultValue
    };
  }
};

export default withAuth(DashBoardPage);
