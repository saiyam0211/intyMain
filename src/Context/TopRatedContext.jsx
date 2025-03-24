import { createContext, useContext, useState } from "react";

const topRatedContext = createContext(0)

const TopRatedContextProvider = ({ children }) => {

    const [topRatedCount, setTopRatedCount] = useState(0);

    return (
        <topRatedContext.Provider value={{ topRatedCount, setTopRatedCount }}>
            {children}
        </topRatedContext.Provider>
    )
}

export default TopRatedContextProvider
export const useTopRatedContext = () => {
    return useContext(topRatedContext);
}