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
			<div class="twelve columns">
				<h1><a href="javascript:void(0);" ng-click="goHome()"><?php bloginfo('name'); ?><img src="<?php echo get_template_directory_uri(); ?>/img/logo.png" /></a></h1>
				<?php
				if(is_multisite()) {
					$sites = wp_get_sites();
					if(!empty($sites)) {
						$current = get_current_blog_id();
						$name = trim(str_replace('BikeIt', '', get_bloginfo('name')));
						echo '<div class="ms-dropdown-title">';
						echo '<h2 class="side-title">' . $name . '<span class="icon-triangle-down"></span></h2>';
						echo '<div class="ms-dropdown">';
							echo '<input type="text" placeholder="' . __('Search cities', 'bikeit') . '" ng-model="msSearch" />';
							$parsed_sites = array();
							foreach($sites as $site) {
								if($current != $site['blog_id']) {
									$details = get_blog_details($site['blog_id']);
									$name = trim(str_replace('BikeIt', '', $details->blogname));
									$parsed_sites[] = array(
										'url' => $details->siteurl,
										'name' => $name
									);
								}
							}
							echo "<ul ng-init='mSites = " . json_encode($parsed_sites) . "'>";
							echo '<li ng-repeat="site in mSites | filter:msSearch"><a href="{{site.url}}">{{site.name}}</a></li>';
							echo '</ul>';
						echo '</div>';
						echo '</div>';
					}
				}
				?>
				<nav id="main-nav">
					<?php wp_nav_menu(); ?>
				</nav>
				<div class="user" ng-controller="UserController" ng-show="loadedUser">
					<div ng-show="user">
						<p>Olá {{user.name}}. <a href="{{logoutUrl}}">Sair</a></p>
					</div>
					<div ng-hide="user">
						<p><a href="#" ng-click="loginForm()">Entrar</a><a href="#">Cadastrar</a></p>
					</div>
				</div>
			</div>
		</div>

	</header>

	<div ui-view autoscroll="false"></div>

	<?php wp_footer(); ?>

</body>
</html>