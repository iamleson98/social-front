<script lang="ts">
	import { graphql } from '$houdini';
	import { Input, Button } from '$lib/components/ui';

	const loginMutation = graphql(`
		mutation TokenCreate($email: String!, $password: String!) {
			tokenCreate(email: $email, password: $password) {
				token
				user {
					id
					email
				}
			}
		}
	`);

	// $: loginMutation.subscribe((data) => {
	// 	console.log(data);
	// });
</script>

<svelte:head>
	<title>Signin</title>
</svelte:head>

<!-- {#if loginMutation.observer.state.fetching}
	<p>loading...</p>
{/if} -->

<div class="w-[500px]">
	<h2>Signin</h2>
	<form>
		<div>
			<Input type="text" invalid placeholder="Enter email or username" icon="mdi:envelope" fullWidth />
		</div>
		<div>
			<Input type="password" placeholder="Enter password" icon="mdi:lock" fullWidth />
		</div>
		<Button variant="filled" size="sm" fullWidth>Let me in</Button>
	</form>
</div>
