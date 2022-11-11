// import { StatusBar } from 'expo-status-bar';
import {
    SafeAreaView,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    Platform,
    Dimensions,
    useColorScheme,
    View,
    TouchableOpacity,
    ImageBackground,
  } from 'react-native';
  // import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
  import React, { useEffect, useState } from "react";
  
  import * as tf from "@tensorflow/tfjs";
  import { fetch, bundleResourceIO, decodeJpeg } from "@tensorflow/tfjs-react-native";
  import Constants from "expo-constants";
  import * as Permissions from "expo-permissions";
  import * as ImagePicker from "expo-image-picker";
  import * as jpeg from "jpeg-js";
  import * as FileSystem from 'expo-file-system';
  import {Colors} from 'react-native/Libraries/NewAppScreen';
  
  export const {height, width} = Dimensions.get('window');
  
  export const fonts = {
    Bold: {fontFamily: 'sans-serif'},
  };
  
  export default function TensorDetection() {
    const [isTfReady, setTfReady] = useState(false); // gets and sets the Tensorflow.js module loading status
    const [model, setModel] = useState(null); // gets and sets the locally saved Tensorflow.js model
    const [image, setImage] = useState(null); // gets and sets the image selected from the user
    const [predictions, setPredictions] = useState(null); // gets and sets the predicted value from the model
    const [error, setError] = useState(false); // gets and sets any errors
  
    //copied
    const [result, setResult] = useState('');
    const [label, setLabel] = useState('');
    const isDarkMode = useColorScheme() === 'light';
    const [imageui, setImageui] = useState('');
    const backgroundStyle = {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
  
    const classes = ["NO","YES"];
  
    useEffect(() => {
      (async () => {
        await tf.ready(); // wait for Tensorflow.js to get ready
        setTfReady(true); // set the state 
        console.log('true');
        // bundle the model files and load the model:
        const model = require("./assets/model.json");
        const weights = require("./assets/group1-shard1of1.bin");
        const loadedModel = await tf.loadGraphModel(
          bundleResourceIO(model, weights)
        );
        
        setModel(loadedModel); // load the model to the state
        
        
        getPermissionAsync(); // get the permission for camera roll access for iOS users
      })();
    }, []);
  
  
    async function getPermissionAsync() {
      if (Constants.platform.ios) {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== "granted") {
          alert("Permission for camera access required.");
        }
      }
    }
  
    const clearOutput = () => {
      setResult('');
      setImageui('');
    };
  
    async function handlerSelectImage() {
      try {
        let response = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true, // on Android user can rotate and crop the selected image; iOS users can only crop 
          quality: 1, // go for highest quality possible
          aspect: [1, 1], // maintain aspect ratio of the crop area on Android; on iOS crop area is always a square
        });
    
        
        if (!response.canceled) {
          const source = { uri: response.assets[0].uri };
          console.log(source);        
          setImageui(source.uri); // put image path to the state
          setLabel('Predicting...');
          setResult('');
  
          const imageTensor = await imageToTensor(source); // prepare the image
          console.log(imageTensor+ 'OK');
          // console.log(model);
          let predictions = await model.predict(imageTensor); // send the image to the model
          // console.log(imageTensor+ "ok");
          console.log(predictions+"HII");
          const a = predictions.arraySync()[0][0];
          const b = predictions.arraySync()[0][1];
          let max = 0;
          if(a>b){
            max =a ;
            setLabel(classes[0]);
          }else{
            max =b;
            setLabel(classes[1]);
          }
          
          // console.log(max.toPrecision(2)*100);
          
          setResult(max*100);
          
          
          // console.log((predictions+'').split(','));
          
        // }
          // setResult(predictions);
  
          // if (res.class) {
          //   setLabel(res.class);
          //   setResult(res.confidence);
          // } else {
          //   setLabel('Failed to predict');
          // }
        }
      } catch (error) {
        setError(error);
      }
    }
  
    async function imageToTensor(source) {
    
      // load the raw data of the selected image into an array
      const fileUri = source.uri;      
      const imgB64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
      const raw = new Uint8Array(imgBuffer)
      // console.log(raw);
      const imageTensor = decodeJpeg(raw);
      // const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
      // console.log(imageTensor + "OK SECOND");
      
  
      //commented
  
      // const rawImageData = await response.arrayBuffer();
      // const { width, height, data } = jpeg.decode(rawImageData, {
      //   useTArray: true, // Uint8Array = true
      // });
      
      // // remove the alpha channel:
      // const buffer = new Uint8Array(width * height * 3);
      // let offset = 0;
      // for (let i = 0; i < buffer.length; i += 3) {
      //   buffer[i] = data[offset];
      //   buffer[i + 1] = data[offset + 1];
      //   buffer[i + 2] = data[offset + 2];
      //   offset += 4;
      // }
      
  
      // // transform image data into a tensor
      // const img = tf.tensor3d(buffer, [width, height, 3]); 
    
      // // calculate square center crop area
      // const shorterSide = Math.min(width, height);
      // const startingHeight = (height - shorterSide) / 2;
      // const startingWidth = (width - shorterSide) / 2;
      // const endingHeight = startingHeight + shorterSide;
      // const endingWidth = startingWidth + shorterSide;
    
      // // slice and resize the image
      // const sliced_img = img.slice(
      //   [startingWidth, startingHeight, 0],
      //   [endingWidth, endingHeight, 3]
      // );
      const resized_img = tf.image.resizeBilinear(imageTensor, [256, 256]).toFloat();
      // // add a fourth batch dimension to the tensor
      const expanded_img = resized_img.expandDims(0);
      // return imageTensor;
      
      return expanded_img;
      // // normalise the rgb values to -1-+1
      // return expanded_img.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    }
  
    return (
      <View style={[backgroundStyle, styles.outer]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ImageBackground
          blurRadius={10}
          source={{uri: 'https://cdn.pixabay.com/photo/2016/03/08/20/03/flag-1244649__340.jpg'}}
          style={{height: height, width: width}}
        />
        <Text style={styles.title}>{'Brain Tumor🧠 \nPrediction App'}</Text>
        <TouchableOpacity onPress={clearOutput} style={styles.clearStyle}>
          <Image source={{uri: 'clean'}} style={styles.clearImage} />
        </TouchableOpacity>
        {(imageui?.length && (
          <Image source={{uri: imageui}} style={styles.imageStyle} />
        )) ||
          null}
        {(result && label && (
          <View style={styles.mainOuter}>
            <Text style={[styles.space, styles.labelText]}>
              {'Label: \n'}
              <Text style={styles.resultText}>{label}</Text>
            </Text>
            <Text style={[styles.space, styles.labelText]}>
              {'Confidence: \n'}
              <Text style={styles.resultText}>
                {parseFloat(result).toFixed(2) + '%'}
              </Text>
            </Text>
          </View>
        )) ||
          (image && <Text style={styles.emptyText}>{label}</Text>) || (
            <Text style={styles.emptyText}>
              Use below buttons to select a picture of a BRAIN MRI IMAGE.
            </Text>
          )}
        <View style={styles.btn}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => manageCamera('Camera')}
            style={styles.btnStyle}>
            {/* <Image source={{uri: 'camera'}} style={styles.imageIcon} /> */}
            <Text style={{fontSize:20}}>CAMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handlerSelectImage()}
            style={styles.btnStyle}>
            {/* <Image source={{uri: 'gallery'}} style={styles.imageIcon} /> */}
            <Text style={{fontSize:20}}>UPLOAD</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    title: {
      alignSelf: 'center',
      position: 'absolute',
      top: ( 35) || 10,
      fontSize: 40,
      ...fonts.Bold,
      color: '#FFF',
    },
    clearImage: {height: 40, width: 40, tintColor: '#FFF'},
    mainOuter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      position: 'absolute',
      top: height / 1.6,
      alignSelf: 'center',
    },
    outer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btn: {
      position: 'absolute',
      bottom: 40,
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    btnStyle: {
      backgroundColor: '#FFF',
      opacity: 0.8,
      marginHorizontal: 30,
      padding: 20,
      borderRadius: 20,
    },
    imageStyle: {
      marginBottom: 50,
      width: width / 1.5,
      height: width / 1.5,
      borderRadius: 20,
      position: 'absolute',
      borderWidth: 0.3,
      borderColor: '#FFF',
      top: height / 4.5,
    },
    clearStyle: {
      position: 'absolute',
      top: 100,
      right: 30,
      tintColor: '#FFF',
      zIndex: 10,
    },
    space: {marginVertical: 10, marginHorizontal: 10},
    labelText: {color: '#FFF', fontSize: 30, ...fonts.Bold},
    resultText: {fontSize: 32,color:'yellow', ...fonts.Bold},
    imageIcon: {height: 40, width: 40, tintColor: '#000'},
    emptyText: {
      position: 'absolute',
      top: height / 1.6,
      alignSelf: 'center',
      color: '#FFF',
      fontSize: 25,
      maxWidth: '70%',
      ...fonts.Bold,
    },
  });