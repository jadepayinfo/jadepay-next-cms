
import Breadcrumbs from "@/components/layout/breadcrumbs";
import withAuth from "@/hoc/with_auth";
import { Company, Platform } from "@/model/company";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

import SingleContainer from "./single";
import BroadcastContainer from "./broadcast";
import BroadcastFromFIleContainer from "./broadcastFromFile";

interface dataType extends Company {
  platform: Platform[];
}

interface Props {
  data: dataType[];
  page: number;
  count: number;
}


const TabContent = ({
  menuTab,
}: {
  menuTab: string;
}) => {
  if (menuTab === '1to1') {
    return <SingleContainer  />;
  } else if (menuTab === 'broadcast') {
    return <BroadcastContainer />;
  } else if (menuTab === 'csv') {
    return <BroadcastFromFIleContainer />;
  } 
};
const NotificationCreatePage: NextPage<Props> = (props) => {
  const [activeTab, setActiveTab] = useState('1to1');
  const tabs = [
    { id: '1to1', label: '1:1 Messaging', icon: '💬' },
    { id: 'broadcast', label: 'Broadcast', icon: '📢'  },
    { id: 'csv', label: 'CSV File', icon: '📄'  }
  ];
  const router = useRouter();
  return (
    <>
      <div>
        <Breadcrumbs
          title="Notification Management"
          items={[
            {
              label: "Notification Management",
            },
          ]}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="flex border-b border-gray-200" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 font-semibold transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  } ${tab.id === tabs[0].id ? 'rounded-tl-lg' : ''}`}
                >
                  <span aria-hidden="true" className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600"></div>
                  )}
                </button>
              ))}
            </div>
            <div className="p-4 ">
            <TabContent menuTab={activeTab} />
        </div>
        </main>
      </div>
    </>
  );
};

export default withAuth(NotificationCreatePage);