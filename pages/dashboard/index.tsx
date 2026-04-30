import { NextPage } from 'next';
import withAuth from '@/hoc/with_auth';
import { initHeaderWithServerSide } from '@/lib/axios';
import { useAuth } from '@/context/auth_context';
import { useEffect, useState } from 'react';

interface Props {}
const DashBoardPage: NextPage<Props> = (props) => {
  const { user } = useAuth();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, [user]);

  if (!isReady) {
    return (
      <div className="h-full flex justify-center items-center">
        <span className="loading loading-spinner w-[2rem] text-primary"></span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Register',
      value: '1,248',
      note: 'Mock data'
    },
    {
      title: 'Total KYC Approve',
      value: '982',
      note: 'Mock data'
    }
  ];

  const monthlyRegisterData = [
    { month: 'Jan', online: 34, fileUpload: 28, ict: 20 },
    { month: 'Feb', online: 40, fileUpload: 30, ict: 25 },
    { month: 'Mar', online: 36, fileUpload: 29, ict: 23 },
    { month: 'Apr', online: 48, fileUpload: 34, ict: 28 },
    { month: 'May', online: 44, fileUpload: 33, ict: 27 },
    { month: 'Jun', online: 53, fileUpload: 37, ict: 31 },
    { month: 'Jul', online: 51, fileUpload: 36, ict: 30 },
    { month: 'Aug', online: 57, fileUpload: 40, ict: 35 },
    { month: 'Sep', online: 55, fileUpload: 39, ict: 34 },
    { month: 'Oct', online: 61, fileUpload: 42, ict: 38 },
    { month: 'Nov', online: 59, fileUpload: 41, ict: 36 },
    { month: 'Dec', online: 66, fileUpload: 45, ict: 41 }
  ];
  const maxRegisterValue = Math.max(
    ...monthlyRegisterData.map((item) => Math.max(item.online, item.fileUpload, item.ict))
  );

  return (
    <div className="p-4 space-y-4">
      <div className="hero bg-base-200 rounded-box">
        <div className="hero-content w-full justify-between flex-col lg:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-base-content/70 mt-1">
              Welcome back{user?.Username ? `, ${user.Username}` : ''}.
            </p>
          </div>
          <div className="badge badge-primary badge-lg">
            Role: {user?.Role || 'Unknown'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statCards.map((card) => (
          <div key={card.title} className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <p className="text-sm text-base-content/70">{card.title}</p>
              <h2 className="card-title text-3xl">{card.value}</h2>
              <p className="text-xs text-base-content/60">{card.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h2 className="card-title">Total Register by Month</h2>
          <p className="text-sm text-base-content/70">Mock data (Online / File Upload / ICT)</p>
          <div className="flex items-center gap-3 text-xs text-base-content/70 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Online
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              File Upload
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              ICT
            </span>
          </div>
          <div className="mt-3 grid grid-cols-12 items-end gap-2 h-52">
            {monthlyRegisterData.map((item) => (
              <div key={item.month} className="col-span-1 flex flex-col items-center justify-end gap-2">
                <div className="w-full flex items-end gap-1 h-full">
                  <div
                    className="flex-1 bg-primary/80 hover:bg-primary rounded-t transition"
                    style={{ height: `${(item.online / maxRegisterValue) * 100}%` }}
                    title={`${item.month} Online: ${item.online}`}
                  />
                  <div
                    className="flex-1 bg-secondary/80 hover:bg-secondary rounded-t transition"
                    style={{ height: `${(item.fileUpload / maxRegisterValue) * 100}%` }}
                    title={`${item.month} File Upload: ${item.fileUpload}`}
                  />
                  <div
                    className="flex-1 bg-accent/80 hover:bg-accent rounded-t transition"
                    style={{ height: `${(item.ict / maxRegisterValue) * 100}%` }}
                    title={`${item.month} ICT: ${item.ict}`}
                  />
                </div>
                <span className="text-xs text-base-content/70">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);

  const defaultValue: Props = {};

  try {
    return {
      props: defaultValue
    };
  } catch (error: any) {
    console.error('DashBoardPage getServerSideProps error', error);
    return {
      props: defaultValue
    };
  }
};

export default withAuth(DashBoardPage);
