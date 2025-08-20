import Link from 'next/link';
import { ReactNode } from 'react';

export type CrumbItem = {
  label: ReactNode;
  path?: string;
};

export type BreadcrumbsProps = {
  title?: string;
  items: CrumbItem[];
};

const Crumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <div className="text-sm breadcrumbs">
      <ul>
        {items.map((crumb, i) => {
          const isLastItem = i === items.length - 1;
          if (!isLastItem) {
            return (
              <li key={i}>
                <Link href={crumb.path!} key={i}>
                  {crumb.label}
                </Link>
              </li>
            );
          } else {
            return <li key={i}>{crumb.label}</li>;
          }
        })}
      </ul>
    </div>
  );
};

const Breadcrumbs = ({ title, items }: BreadcrumbsProps) => {
  return (
    <div className="flex p-4 items-center justify-between rounded-lg bg-[--bg-breadcrumbs] text-[--text]">
      <div>{title}</div>
      <Crumbs items={items} />
    </div>
  );
};
export default Breadcrumbs;
