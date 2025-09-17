import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

type Props = {
  className?: string;
  headerClassName?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  title?: string;
  sidebar?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
};

const DashboardLayout: React.FC<Props> = ({
  className,
  headerClassName,
  sidebarClassName,
  contentClassName,
  title,
  sidebar,
  headerRight,
  children,
}) => {
  return (
    <div className={className ?? 'min-h-screen flex'}>
      <Sidebar className={sidebarClassName ?? 'w-64'}>{sidebar}</Sidebar>
      <div className="flex-1 flex flex-col">
        <Header className={headerClassName ?? 'w-full'} title={title} right={headerRight} />
        <main className={contentClassName ?? 'flex-1'}>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;