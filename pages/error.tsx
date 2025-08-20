import { useAuth } from '@/context/auth_context';
import { AccessType } from '@/model/staff_info';
import axios from 'axios';
import { NextPage } from 'next';
import { Url } from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const Error: NextPage = () => {
  const router = useRouter();
  const [counter, setCounter] = useState(5);
  const [loadingAccessMenu, setLoadingAccessMenu] = useState(true);

  const message = router.query.message ?? 'Authentication error' as string | undefined;
  let redirect = router.query.redirect ?? '/login' as string | undefined | Url;

  const { staff } = useAuth();


  useEffect(() => {
    console.log('getLoadData');
    const getLoadData = async () => {
      try {
        const info = await axios.get(`/api/staff/info`);
        const menu: AccessType[] = info.data?.role?.access ?? [];
        const checkAccessDashboard = menu.find(
          (item) => item.menu_name === 'dashboard'
        );

        if (checkAccessDashboard) {
          redirect = '/dashboard';
        } else {
          redirect = '/staff/ownerprofile';
        }
        setLoadingAccessMenu(false);
      } catch (err: any) {
      } finally {
      }
    };

    if (loadingAccessMenu) {
      getLoadData();
    }
  }, [loadingAccessMenu]);

  useEffect(() => {
    const counterInterval = setInterval(() => {
      setCounter(counter - 1);
        if (counter === 1) {
          const url:string = redirect?.toString() ?? '';
          router.push(url)
        }; 
    }, 1000);
    return () => {
      clearInterval(counterInterval);
    };
  }, [counter, router, staff]);

  const DisplayPage = () => {
    let textPage = '';
    if (redirect == '/dashboard') {
      textPage = 'dashboard page';
    } else if (redirect == '/staff/ownerprofile') {
      textPage = 'Owner profile page';
    }

    return (
      <Link legacyBehavior href={redirect as Url}>
        <span className="text-primary cursor-pointer">
          {redirect == '/dashboard' ||
          redirect == '/staff/ownerprofile'
            ? textPage
            : 'Login page'}
        </span>
      </Link>
    );
  };

  return (
    <div className="hero min-h-screen bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <span className="loading loading-ring loading-lg mb-5"></span>
          <h1 className="text-2xl font-bold">{message}</h1>
          <p className="py-6">
            <span className="mx-1">Going to</span>
            <DisplayPage />
            <span className="countdown mx-1">
              <span style={{ '--value': counter } as any}></span>
            </span>
            secound
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error;
