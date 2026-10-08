import { useState } from "react";
import { createContext } from "react";

export let UserData = createContext()

export default function UserDataProvider({children}){
    const [user, setUser] = useState(null)
    const [userLoggedin, setUserLoggedin] = useState(null)

    return <UserData value={{user, setUser, userLoggedin, setUserLoggedin}}>{children}</UserData> 
} 