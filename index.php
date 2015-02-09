<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>" />
<title><?php
	global $page, $paged;

	wp_title( '|', true, 'right' );

	bloginfo( 'name' );

	$site_description = get_bloginfo('description', 'display');
	if ( $site_description && ( is_home() || is_front_page() ) )
		echo " | $site_description";

	if ( $paged >= 2 || $page >= 2 )
		echo ' | ' . __('Page', 'bikeit') . max($paged, $page);

	?></title>
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo('stylesheet_url'); ?>" />
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />
<link rel="shortcut icon" href="<?php echo get_template_directory_uri(); ?>/img/favicon.ico" type="image/x-icon" />
<?php wp_head(); ?>
</head>
<body <?php body_class(get_bloginfo('language')); ?> ng-controller="SiteController">

	<header id="masthead">

		<div class="container">
			<div class="three columns">
				<h1><a href="javascript:void(0);" ng-click="goHome()"><?php bloginfo('name'); ?><img src="<?php echo get_template_directory_uri(); ?>/img/logo.png" /></a></h1>
			</div>
			<div class="three columns">
				<div class="user" ng-controller="UserController" ng-init="getUser()" ng-show="loadedUser">
					<div ng-show="user">
						<p>Olá {{user.name}}. <a href="{{logoutUrl}}">Sair</a></p>
					</div>
					<div ng-hide="user">
						<p><a href="#">Entrar</a><a href="#">Cadastrar</a></p>
					</div>
				</div>
			</div>
		</div>

	</header>

	<div ui-view autoscroll="false"></div>

	<!-- <div ng-controller="LoginForm">
		<form ng-submit="login(form)">
			<input type="text" ng-model="form.user_login" />
			<input type="password" ng-model="form.user_password" />
			<input type="checkbox" ng-model="form.remember" />
			<input type="submit" />
		</form>
	</div> -->

	<?php wp_footer(); ?>

</body>
</html>