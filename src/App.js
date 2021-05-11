import { BrowserRouter, Route, Switch } from "react-router-dom";

import Main from './pages/Main/index';
import Room from './pages/Room/index';
import ChooseNane from './pages/ChooseName/index';
import NotFound404 from './pages/NotFound404/index';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Main} />
        <Route exact path="/room/:id" component={Room} />
        <Route exact path="/name/:id" component={ChooseNane} />
        <Route component={NotFound404} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
