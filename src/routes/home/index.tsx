import { h } from 'preact';
import Calculator from '../../components/Calculator/Calculator';

// TODO support css modules
const style = require('./style');

const Home = (_props: any) => {
  return <Calculator />;
};

export default Home;
