import { useState } from 'react';
import {
  IonInput,
  IonLabel,
  InputCustomEvent,
  IonChip,
  IonIcon
} from '@ionic/react';

import {closeCircle} from 'ionicons/icons';

interface ChipInputProps {
    value: string[];
    onChange:  (value: string[]) => void;
  }

const ChipInput: React.FC<ChipInputProps> = ({ value, onChange }) => {

    const [currentValue, setCurrentValue] = useState<string>("");
  
    const ENTER = 13;
    const ENTER_KEY = "Enter"
    const BACKSPACE = 8;
    const BACKSPACE_KEY = "Backspace"

    const handleKeyEvent = (evt: any) => {
        if (evt.which === ENTER || evt.key === ENTER_KEY) {
            let newValues = value.concat([currentValue]).filter(val => val !== "");
            onChange(newValues)
            setCurrentValue("")
        }
        if (evt.which === BACKSPACE || evt.key === BACKSPACE_KEY) {

            if(currentValue === "") {
                evt.preventDefault();
                setCurrentValue(value.pop() || "")
                let newValues = value.filter(val => val !== "");
                onChange(newValues)
            }
        }
    }

    const removeValue = (valueToRemove: string) => {
        onChange(value.filter(val => val !== valueToRemove))
    }

    return (
    <>  

        <IonInput style={{display:"none"}} value={value.join(",")}> </IonInput>

        <span style={{display: "flex", flex: "1", width: "100%"}}>
            {value.map((value) => 
                <IonChip key={value}>
                  <IonLabel>{value}</IonLabel>
                  <IonIcon onClick={() => removeValue(value)} icon={closeCircle}></IonIcon>
                </IonChip>
            )}
            <IonInput 
                onKeyDown={handleKeyEvent}
                onIonChange={(evt: InputCustomEvent) => setCurrentValue(evt?.detail?.value || "")} 
                placeholder='...' 
                value={currentValue}> 

            </IonInput>
        </span>
    </>
    );
}

export default ChipInput;
