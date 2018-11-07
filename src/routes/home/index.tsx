import { h } from 'preact';
import interpreter from '../../interpreter';

// TODO support css modules
const style = require('./style');

const Home = (props: any) => (
  <div class={style.home}>
    <h1>Home</h1>
    <p>{interpreter('1+1')}</p>
  </div>
);

export default Home;
