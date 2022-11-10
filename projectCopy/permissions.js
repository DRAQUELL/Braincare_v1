import {Alert, Platform,PermissionsAndroid} from 'react-native';
import {
  check,
  PERMISSIONS,
  RESULTS,
  request,
  openSettings,
} from 'react-native-permissions';

// export const isIOS = Platform.OS === 'ios';

function showAlert(msg) {

  Alert.alert('', msg, [
    {
      text: 'Cancel',
      onPress: () => console.log('Cancel Pressed'),
      style: 'cancel',
    },
    
  ]);
}

const hasCameraPermission = async (withAlert = true) => {
  try {
    const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
    const response = await PermissionsAndroid.check(permission);
    let camera;
    if (response !== PermissionsAndroid.RESULTS.GRANTED) {
      camera = await PermissionsAndroid.request(permission
        // ,{
        //         title: "Camera Permission Required",
        //         buttonNeutral: "Not Right Now!",
        //         buttonNegative: "Cancel",
        //         buttonPositive: "Alright"
            // }
            );
    }
    if (camera === PermissionsAndroid.RESULTS.DENIED || camera === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      // if (withAlert) {
        console.log("denied");
        showAlert(
          'Permission not granted for camera. You will not able to use camera in this application.',
        );
      // }
      return false;
    }
    // const granted = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.CAMERA,
    //     {
    //         title: "Camera Permission Required",
    //         message:'NO',
    //         buttonNeutral: "Not Right Now!",
    //         buttonNegative: "Cancel",
    //         buttonPositive: "Alright"
    //     }
    //     );
    //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //         console.log("Camera access is granted");
    //         return true;
    //     } else {
    //         console.log("Permission of Camera is denied");
    //         return false;
    //     }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const hasPhotoPermission = async (withAlert = true) => {
  try {
    const permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
    const response = await PermissionsAndroid.check(permission);
    let photo;
    if (response.photo !== PermissionsAndroid.RESULTS.GRANTED) {
      photo = await PermissionsAndroid.request(permission,{
        title: "Photo Permission Required",
        message:'NO',
        buttonNeutral: "Not Right Now!",
        buttonNegative: "Cancel",
        buttonPositive: "Alright"
    });
    }
    
    if (photo === PermissionsAndroid.RESULTS.DENIED || photo === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    //   if (withAlert) {
        console.log("denied");
        showAlert(
          'Permission not granted for photos. You will not able to get photos in this application.',
        );
    //   }
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const PermissionsService = {
  hasCameraPermission,
  hasPhotoPermission,
};

export default PermissionsService;