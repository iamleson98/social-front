<script lang="ts">
	import { Button } from '$lib/components/ui';
</script>

<div>
	<h1>Reset Password</h1>
	<form action="?/request_password_reset">
		<input type="email" placeholder="Enter your email here" />
		<Button variant="filled" size="sm" fullWidth type="submit">Send me email</Button>
	</form>
</div>
