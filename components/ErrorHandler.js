import axios from "axios";
import Globals from "./Globals";


export const useErrorHandler = async (error) => {
    let url = Globals.API_URL;
    try {
        let data = await axios.post(`${url}/Logging/FrontEndlogError`, {
            "deviceType": "5",
            "message": error
        })
    } catch (apiError) {
        console.log("Error running API", apiError);
    }
};