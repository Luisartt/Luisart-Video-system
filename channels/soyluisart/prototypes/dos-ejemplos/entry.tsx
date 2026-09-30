import { Composition, registerRoot } from "remotion";
import { DosEjemplos, dosEjemplosDuration } from "./DosEjemplos";

registerRoot(() => <Composition id="dos-ejemplos" component={DosEjemplos} width={1080} height={1920} fps={30} durationInFrames={dosEjemplosDuration} />);
