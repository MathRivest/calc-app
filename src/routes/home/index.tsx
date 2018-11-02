import { h } from 'preact';
// TODO support css modules
const style = require('./style');

const Home = (props: any) => (
	<div class={style.home}>
		<h1>Home</h1>
		<p>This is the Home component.</p>
	</div>
);

export default Home;
