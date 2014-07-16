<h1><i class="fa fa-fire"></i> IFSTA Account Authentication</h1>
<hr />

<form class="sso-ifsta-settings">
	<div class="alert alert-warning">
		<p>
			Please refer to IFSTA Account client settings for appropriate values. All fields are mandatory.
		</p>
		<br />
		<div class="form-group">
			<input type="text" name="id" title="Client ID" class="form-control input-lg" placeholder="Client ID">
		</div>
		<div class="form-group">
			<input type="text" name="secret" title="Client Secret" class="form-control" placeholder="Client Secret">
		</div>
		<div class="form-group">
			<input type="text" name="authUrl" title="Authorization URL" class="form-control" placeholder="Authorization URL">
		</div>
		<div class="form-group">
			<input type="text" name="tokenUrl" title="Token URL" class="form-control" placeholder="Token URL">
		</div>

		<div class="form-group">
			<input type="text" name="userProfileUrl" title="User Profile URL" class="form-control" placeholder="User Profile URL">
		</div>
	</div>
</form>

<button class="btn btn-lg btn-primary" type="button" id="save">Save</button>

<script>
	require(['settings'], function(Settings) {
		Settings.load('sso-ifsta', $('.sso-ifsta-settings'));

		$('#save').on('click', function() {
			Settings.save('sso-ifsta', $('.sso-ifsta-settings'));
		});
	});
</script>