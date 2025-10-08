import ButtonFill from '@/components/buttons/button_fill';
import ButtonOutline from '@/components/buttons/button_outline';
import { IconCircleLeft, IconEyeClose, IconEyeOpen } from '@/components/icon';
import InputCustom from '@/components/input/input';
import Breadcrumbs from '@/components/layout/breadcrumbs';
import AlertSBD from '@/components/share/modal/alert_sbd';
import { useAuth } from '@/context/auth_context';
import { UserInfoType } from '@/model/user_info';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface Props {
  user: UserInfoType | undefined;
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
      current_password: currentpassword,
      new_password: newpassword
    };

    let res: any;
    try {
      if (loading) return;
      setLoading(true);
      res = await axios.post('/api/authen/changepassword', playload);
      const { success, status, status_detail } = res.data;

      if (success && status === 1) {
        setLoading(false);
        AlertSBD.fire({
          icon: 'success',
          titleText: 'Successfully!',
          text: `You have successfully changed to new password.`,
          showConfirmButton: false
        }).then(() => {
          props!.onBack();
        });
        return;
      } else {
        setLoading(false);
        AlertSBD.fire({
          icon: 'error',
          titleText: 'Change password failed',
          text: status_detail || 'Please try again',
          showConfirmButton: false
        });
      }
    } catch (error: any) {
      setLoading(false);
      AlertSBD.fire({
        icon: 'error',
        titleText: 'Change password Error',
        text: res?.data?.status_detail || error?.response?.data?.message || 'An error occurred',
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

        <div className="flex flex-col justify-center mx-auto max-w-md">
          <div className="p-6 bg-[--bg-panel] border border-[--border-color] rounded-lg mt-5">
            <div className="flex flex-col gap-4">
              <InputCustom
                id="txt-username"
                name="username"
                title="Username"
                type="text"
                placeholder="Username"
                value={props?.user?.Username || ''}
                readOnly
                disabled
              />

              <InputCustom
                id="txt-currentpassword"
                name="currentpassword"
                title="Current Password"
                role="presentation"
                autoComplete="new-password"
                type={isShowCurrentPassword ? 'password' : 'text'}
                placeholder="Enter current password"
                value={currentpassword}
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

              <InputCustom
                id="txt-newpassword"
                name="newpassword"
                title="New Password"
                type={isShowPassword ? 'password' : 'text'}
                placeholder="Enter new password"
                value={newpassword}
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

              <InputCustom
                id="txt-confirmpassword"
                name="confirmpassword"
                title="Confirm Password"
                type={isShowConfirmPassword ? 'password' : 'text'}
                placeholder="Confirm new password"
                value={confirmpassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                suffixIcon={
                  isShowConfirmPassword ? (
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

              <div className="flex justify-center pt-2">
                <ButtonFill size="md" onClick={onSubmit} disabled={loading}>
                  {loading && (
                    <span className="loading loading-spinner"></span>
                  )}
                  <span>Update Password</span>
                </ButtonFill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffChangePassword;
