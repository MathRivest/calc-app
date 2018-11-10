import { h } from 'preact';
import Interpreter from '../../components/Interpreter'

// TODO support css modules
const style = require('./style');

const Home = (_props: any) => {
  return (
    <div class={style.home}>
      <Interpreter value={'2+2'}></Interpreter>
      <Interpreter value={'5-1'}></Interpreter>
    </div>
  )
};

export default Home;
