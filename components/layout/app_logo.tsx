import {
  IconCloseOutline,
  IconLogo
} from '@/components/icon';
import { useMenu } from '@/context/menu_context';
import { cn } from '@/lib/css';
import { FC, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  onIconMenu?: (val: boolean) => void;
}

export const AppLogo: FC<Props> = (props) => {
  const { isIconMenu } = useMenu();
  const { title, className, onIconMenu, ...PropsComponent } = props;

  let classCustom = 'flex gap-2 justify-center items-center py-4 relative';

  return (
    <div className={cn(classCustom, className)} {...PropsComponent}>
      <IconLogo className="text-[36px] text-primary" />
      {title ? <span className="font-bold">{title}</span> : null}
      {onIconMenu != undefined ? (
        <div className="absolute top-6 right-3">
          {!isIconMenu ? (
            <IconCloseOutline
              onClick={() => onIconMenu(true)}
              className="cursor-pointer text-primary text-[20px] bg-base-100 rounded-full  overflow-hidden z-[4000]"
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
