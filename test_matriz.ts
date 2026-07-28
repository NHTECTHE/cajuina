import { getMatrizAction } from "./src/app/actions/modalidades";

getMatrizAction().then(res => console.log(JSON.stringify(res, null, 2)));
