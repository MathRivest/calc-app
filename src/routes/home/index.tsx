import { h } from 'preact';
import Interpreter from '../../components/Interpreter';

// TODO support css modules
const style = require('./style');

const Home = (_props: any) => {
  return (
    <div class={style.home}>
      <Interpreter value={'2+2'} />
      <Interpreter value={'5-10'} />
      <Interpreter value={'100*4'} />
      <Interpreter value={'100/4'} />
      <Interpreter value={'1*2+3'} />
      <Interpreter value={'1+2*3+2+6/2'} />
    </div>
  );
};

export default Home;
