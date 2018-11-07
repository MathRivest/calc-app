import { h } from 'preact';
import { Link } from 'preact-router/match';
const style = require('./style');

const Header = () => (
	<header class={style.header}>
		<h1>Preact App</h1>
		<nav>
			<Link activeClassName={style.active} href="/">Home</Link>
		</nav>
	</header>
);

export default Header;
