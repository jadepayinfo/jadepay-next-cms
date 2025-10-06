import ButtonFill from '@/components/buttons/button_fill';
import ButtonOutline from '@/components/buttons/button_outline';
import { IconCircleLeft, IconEyeClose, IconEyeOpen } from '@/components/icon';
import InputCustom from '@/components/input/input';
import Breadcrumbs from '@/components/layout/breadcrumbs';
import AlertSBD from '@/components/share/modal/alert_sbd';
import { useAuth } from '@/context/auth_context';
import { StaffInfoType } from '@/model/staff_info';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface Props {
  staff: StaffInfoType | undefined;
  onBack: () => void;
}
const StaffChangePassword = (props: Props) => {
  const [isShowCurrentPassword, setIsShowCurrentPassword] = useState<boolean>(true);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(true);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState<boolean>(true);
  const [currentpassword, setCurrentPassword] = useState('');
  const [newpassword, setNewPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async () => {
    console.log('username :', props.staff?.username);
    console.log('currentpassword : ', currentpassword);
    console.log('newpassword : ', newpassword);
    console.log('confirmpassword : ', confirmpassword);
    
    //validation
    if(currentpassword === '' || newpassword === '' || confirmpassword === ''){
      debugger;
      AlertSBD.fire({
        icon: 'error',
        titleText: 'Fill field',
        text: 'currentpassword, newpassword and confirmpassword',
        showConfirmButton: false
      });
      return;
    }

    if(newpassword != confirmpassword){
      AlertSBD.fire({
        icon: 'error',
        titleText: 'Validation fill',
        text: 'new password and confirm password dose not match',
        showConfirmButton: false
      });
      return;
    }


    

    let playload: any = {
      old_password: currentpassword,
      new_password: newpassword
    };

    try {
      if (loading) return;
      setLoading(true);
      const res = await axios.post('/api/staff/changepassword', playload);
      const { success } = res.data;
      if (success) {
        setLoading(false);
        AlertSBD.fire({
          icon: 'success',
          titleText: 'Successfully!',
          text: `You have successfully Change to new password.`,
          showConfirmButton: false
        }).then(() => {
          props!.onBack();
        });
        return;
      }
    } catch (error: any) {
      setLoading(false);
      AlertSBD.fire({
        icon: 'error',
        titleText: 'Change password Error',
        text: error?.response?.data?.message,
        showConfirmButton: false
      });
    }
  };

  return (
    <>
      <div className="p-4">
        <Breadcrumbs
          title="Change Password"
          items={[
            {
              label: 'Change Password'
            }
          ]}
        />
        <div className="py-4">
          <ButtonOutline size="md" onClick={props.onBack}>
            <IconCircleLeft /> Back
          </ButtonOutline>
        </div>
        <div className=" flex flex-col justify-center mx-auto max-w-md">
        <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-lg mt-5 ">
            <div className="flex flex-wrap justify-center items-center ">
              <div className="flex flex-col" style={{ width: '100%' }}>
                <InputCustom
                  id="txt-username"
                  name="username"
                  title="Username"
                  type="text"
                  placeholder="username"
                  value={props?.staff?.username}
                  readOnly
                  // prefixIcon={<IconUser className="text-[24px]" />}
                />
              </div>
            </div>
            <div className="flex flex-col" style={{ width: '100%' }}>
              <InputCustom
                name="currentpassword"
                title="Current Password"
                role="presentation"
                autoComplete="new-password"
                type={isShowCurrentPassword ? 'password' : 'text'}
                onChange={(e) => setCurrentPassword(e.target.value)}
                suffixIcon={
                  isShowCurrentPassword ? (
                    <IconEyeClose
                      className="text-[24px] cursor-pointer"
                      onClick={() => setIsShowCurrentPassword(!isShowCurrentPassword)}
                    />
                  ) : (
                    <IconEyeOpen
                      className="text-[24px] cursor-pointer"
                      onClick={() => setIsShowCurrentPassword(!isShowCurrentPassword)}
                    />
                  )
                }
              />
            </div>
            <div className="flex flex-col" style={{ width: '100%' }}>
              <InputCustom
                id="txt-newpassword"
                name="newpassword"
                title="New Password"
                type={isShowPassword ? 'password' : 'text'}
                onChange={(e) => setNewPassword(e.target.value)}
                suffixIcon={
                  isShowPassword ? (
                    <IconEyeClose
                      className="text-[24px] cursor-pointer"
                      onClick={() => setIsShowPassword(!isShowPassword)}
                    />
                  ) : (
                    <IconEyeOpen
                      className="text-[24px] cursor-pointer"
                      onClick={() => setIsShowPassword(!isShowPassword)}
                    />
                  )
                }
              />
            </div>
            <div className="flex flex-col" style={{ width: '100%' }}>
              <InputCustom
                id="txt-confirmpassword"
                name="confirmpassword"
                title="Confirm Password"
                type={isShowPassword ? 'password' : 'text'}
                onChange={(e) => setConfirmPassword(e.target.value)}
                suffixIcon={
                  isShowPassword ? (
                    <IconEyeClose
                      className="text-[24px] cursor-pointer"
                      onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
                    />
                  ) : (
                    <IconEyeOpen
                      className="text-[24px] cursor-pointer"
                      onClick={() => setIsShowConfirmPassword(!isShowConfirmPassword)}
                    />
                  )
                }
              />
            </div>

            <div
              className="flex flex-col justify-center items-center p-4"
              style={{ textAlign: 'center' }}
            >
              <ButtonFill size="md" onClick={onSubmit}>
                {loading && (
                  <span className="ml-1 loading loading-spinner"></span>
                )}
                <span>Update</span>
              </ButtonFill>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffChangePassword;
