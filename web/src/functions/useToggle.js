import {useState} from "react";

export default function useToggle(initialValue = false) {

    const [value, setValue] = useState(initialValue);

    const toggleValue = (optionalValue) => {
        if (typeof optionalValue === "boolean") {
            setValue(optionalValue)
        } else {
            setValue(prev => !prev);
        }
    }

    return [value, toggleValue]
}
