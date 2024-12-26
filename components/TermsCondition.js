import { useEffect, useState } from "react";
import { Image, Modal, StyleSheet, Text, View, TouchableOpacity, PermissionsAndroid, Platform } from "react-native"
import { Checkbox } from "react-native-paper";
import WebView from "react-native-webview";
import { useErrorHandler } from "./ErrorHandler";


const TermsCondition = ({ navigation }) => {
    const [checked, setChecked] = useState(false);
    const [showWebView, setShowWebView] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const handlePressForModal = () => {
        setShowWebView(true);
    };

    const handleCloseWebView = () => {
        setShowWebView(false);
    };

    const handleCheckboxChange = () => {
        setChecked(!checked);
    };

    // const handlePressForNext = () => {
    //     if (!checked) {
    //         setShowMessage(true);
    //     } else {
    //         navigation.navigate('VerifyNumber');
    //     }
    // }

    const closeModal = () => {
        setModalVisible(false)
    }

    const checkApplicationPermission = async () => {
        try {
            if (Platform.OS === "android") {
                try {
                    const response = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    );
                } catch (error) {
                    await useErrorHandler(
                        "(Android): VerifyNumber > checkApplicationPermission()" + error
                    );
                }
            }
        } catch (error) {
            await useErrorHandler(
                "(Android): VerifyNumber > checkApplicationPermission()" + error
            );
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        checkApplicationPermission();
        return () => {
            controller.abort();
        };
    }, []);
    return (
        <View style={styles.container}>
            <Image
                source={require("../assets/companylogo.png")}
                style={styles.companylogo}
            />
            <Image
                source={require("../assets/vector-Ypq.png")}
                style={styles.vectorP61}
            />

            <Text style={{ textAlign: 'left', width: '90%', fontSize: 20 }}>
                Please read our
                <Text style={{ color: 'blue' }} onPress={handlePressForModal}> terms and conditions</Text>
                {showWebView && (
                    <Modal
                        visible={showWebView}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={handleCloseWebView} // Handle back press or modal close
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.webViewContainer}>
                                <WebView
                                    source={{ uri: "https://revords.com/RevordsT&C.html" }}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </View>
                    </Modal>
                )} and &nbsp;
                <Text style={{ color: 'blue', fontSize: 20 }} onPress={handlePressForModal}>privacy policy</Text>.
            </Text>

            <View style={{ top: '20%', flexDirection: 'row', width: '90%', alignSelf: 'flex-start', marginLeft: '3%' }}>
                <Checkbox
                    status={checked ? "checked" : "unchecked"}
                    onPress={handleCheckboxChange}
                />
                <Text style={styles.checkboxText}>
                    I have read and accept the terms and condition, and Privacy Policy.
                </Text>
            </View>

            <View style={{ width: '100%', alignItems: 'center', position: 'absolute', bottom: '5%' }}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => navigation.navigate('VerifyNumber')}
                    style={[styles.frame2vJu, {
                        opacity: checked ? 1 : 0.5
                    }]}
                    disabled={!checked}
                >
                    <Text style={styles.getStartednru}>Next</Text>
                    <Image source={require('../assets/arrowcircleright-R8m.png')} style={styles.arrowcirclerightTy3} />
                </TouchableOpacity>
            </View>

            {/* <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Please agree to the terms and conditions to proceed.</Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal> */}
        </View >
    );
}

const styles = StyleSheet.create({
    messageText: {
        color: 'red', // Or any color that fits your design
        fontSize: 14,
        marginTop: 10, // Adjust spacing
        textAlign: 'center',
    },
    container: {
        height: "100%",
        width: "100%",
        backgroundColor: "#d9e7ed",
        alignItems: "center",
    },
    companylogo: {
        flexShrink: 0,
        width: "70%",
        resizeMode: "contain",
    },
    vectorP61: {
        width: 650,
        height: 527,
        position: 'absolute',
        left: 20,
        top: 170,
        resizeMode: 'contain'
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Background overlay
    },
    webViewContainer: {
        width: "90%",
        height: "80%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    checkboxText: {
        marginLeft: 10,
        fontSize: 15,
        color: "#646369",
    },
    frame2vJu: {
        marginTop: "50%",
        marginBottom: 35,
        backgroundColor: "#140d05",
        borderRadius: 8,
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 15,
        width: "50%",
        flexDirection: "row",
    },
    arrowcirclerightTy3: {
        height: 20,
        width: 20,
        resizeMode: "contain",
        flexShrink: 0,
        marginRight: 30,
    },
    getStartednru: {
        textTransform: "uppercase",
        fontFamily: "SatoshiVariable, SourceSansPro",
        flexShrink: 0,
        fontWeight: "bold",
        fontSize: 20,
        color: "#ffffff",
        textAlign: "center",
        flex: 10,
        zIndex: 10,
        width: "100%",
    },
    closeButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        zIndex: 1
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
})

export default TermsCondition;