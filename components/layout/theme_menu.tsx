import { useTheme } from '@/context/theme_context';
import { IconClose, IconSetting } from '../icon';

// TODO: mode svg code to file and use import and refactor code theme

export const ButtonOpenThemeSetting = () => {
  return (
    <label
      htmlFor="my-theme-drawer"
      className="drawer-button p-2 hover:cursor-pointer hover:animate-spin"
    >
      <IconSetting />
    </label>
  );
};

const ThemeMenu = () => {

  const appVersion = process.env.APP_VERSION || '1.0.0';

  const { themeName, isDark, changeMode, changeTheme, themeNameList } =
    useTheme();
  return (
    <>
      <div className="drawer drawer-end">
        <input id="my-theme-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content"></div>
        <div className="drawer-side z-[7000]">
          <label
            htmlFor="my-theme-drawer"
            className="drawer-overlay !bg-transparent"
          ></label>
          <div className="w-80 h-full bg-base-100 border-l border-l-base-300">
            <div className="flex items-center justify-between gap-5 m-4">
              <div className="flex gap-2 items-center">
                <div className="text-lg">Setting</div>
                <IconSetting className="animate-spin" />
              </div>
              <label htmlFor="my-theme-drawer" className="cursor-pointer">
                <IconClose className="text-[18px]" />
              </label>
            </div>
            <div className="border-b border-b-base-300 mx-2"></div>
            <div className="m-4 flex flex-col gap-4">
              <div className="flex flex-col justify-between gap-2 text-sm">
                <div>Version: {appVersion}</div>
              </div>
              <div className="flex flex-col justify-between gap-2 text-sm">
                <div>Theme Option</div>
                <div className="flex gap-5">
                  <div
                    className={`grow p-2 btn border rounded-xl ${
                      isDark ? 'border-primary border-2' : 'border-gray-500'
                    } capitalize`}
                    onClick={() => changeMode('dark')}
                  >
                    <svg
                      className={`w-5 text-neutral ${
                        isDark ? 'fill-primary' : 'fill-current'
                      } `}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                    </svg>
                    <span className="text-xs">Dark</span>
                  </div>
                  <div
                    className={`grow p-2 btn border rounded-xl ${
                      !isDark ? 'border-primary border-2' : 'border-gray-500'
                    } capitalize`}
                    onClick={() => changeMode('light')}
                  >
                    <svg
                      className={`w-5 text-neutral ${
                        !isDark ? 'fill-primary' : 'fill-current'
                      } `}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                    </svg>
                    <span className="text-xs">Light</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-2 text-sm">
                <div>Theme Name</div>
                <div className="grid grid-cols-12 gap-5">
                  {Array.from(themeNameList)
                    .filter((theme) => theme.isDark === isDark)
                    .map((theme, index) => {
                      return (
                        <label
                          key={index}
                          onClick={() => changeTheme(theme.name)}
                          className={`col-span-6 p-2 btn border rounded-xl ${
                            themeName === theme.name
                              ? 'border-primary border-2'
                              : 'border-gray-500'
                          }`}
                        >
                          <div
                            className="w-4 h-4 p-1 rounded-full"
                            style={{ backgroundColor: theme.color }}
                          >
                            {themeName === theme.name ? (
                              <svg
                                className=" text-base-100 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M9 22l-10-10.598 2.798-2.859 7.149 7.473 13.144-14.016 2.909 2.806z" />
                              </svg>
                            ) : null}
                          </div>
                          <span className="capitalize text-xs">
                            {theme.name}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ThemeMenu;
