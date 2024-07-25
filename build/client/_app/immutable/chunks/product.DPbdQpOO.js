var F={NAME:"Name",DOCUMENT:"Document",OPERATION_DEFINITION:"OperationDefinition",VARIABLE_DEFINITION:"VariableDefinition",SELECTION_SET:"SelectionSet",FIELD:"Field",ARGUMENT:"Argument",FRAGMENT_SPREAD:"FragmentSpread",INLINE_FRAGMENT:"InlineFragment",FRAGMENT_DEFINITION:"FragmentDefinition",VARIABLE:"Variable",INT:"IntValue",FLOAT:"FloatValue",STRING:"StringValue",BOOLEAN:"BooleanValue",NULL:"NullValue",ENUM:"EnumValue",LIST:"ListValue",OBJECT:"ObjectValue",OBJECT_FIELD:"ObjectField",DIRECTIVE:"Directive",NAMED_TYPE:"NamedType",LIST_TYPE:"ListType",NON_NULL_TYPE:"NonNullType"};class R extends Error{constructor(r,t,a,o,u,s,h){super(r),this.name="GraphQLError",this.message=r,u&&(this.path=u),t&&(this.nodes=Array.isArray(t)?t:[t]),a&&(this.source=a),o&&(this.positions=o),s&&(this.originalError=s);var f=h;if(!f&&s){var N=s.extensions;N&&typeof N=="object"&&(f=N)}this.extensions=f||{}}toJSON(){return{...this,message:this.message}}toString(){return this.message}get[Symbol.toStringTag](){return"GraphQLError"}}var l,n;function d(e){return new R(`Syntax Error: Unexpected token at ${n} in ${e}`)}function g(e){if(e.lastIndex=n,e.test(l))return l.slice(n,n=e.lastIndex)}var k=/ +(?=[^\s])/y;function q(e){for(var r=e.split(`
`),t="",a=0,o=0,u=r.length-1,s=0;s<r.length;s++)k.lastIndex=0,k.test(r[s])&&(s&&(!a||k.lastIndex<a)&&(a=k.lastIndex),o=o||s,u=s);for(var h=o;h<=u;h++)h!==o&&(t+=`
`),t+=r[h].slice(a).replace(/\\"""/g,'"""');return t}function i(){for(var e=0|l.charCodeAt(n++);e===9||e===10||e===13||e===32||e===35||e===44||e===65279;e=0|l.charCodeAt(n++))if(e===35)for(;(e=l.charCodeAt(n++))!==10&&e!==13;);n--}var v=/[_A-Za-z]\w*/y,D=new RegExp("(?:(null|true|false)|\\$("+v.source+')|(-?\\d+)((?:\\.\\d+)?[eE][+-]?\\d+|\\.\\d+)?|("""(?:"""|(?:[\\s\\S]*?[^\\\\])"""))|("(?:"|[^\\r\\n]*?[^\\\\]"))|('+v.source+"))","y"),S=function(e){return e[e.Const=1]="Const",e[e.Var=2]="Var",e[e.Int=3]="Int",e[e.Float=4]="Float",e[e.BlockString=5]="BlockString",e[e.String=6]="String",e[e.Enum=7]="Enum",e}(S||{}),M=/\\/g;function A(e){var r,t;if(D.lastIndex=n,l.charCodeAt(n)===91){n++,i();for(var a=[];l.charCodeAt(n)!==93;)a.push(A(e));return n++,i(),{kind:"ListValue",values:a}}else if(l.charCodeAt(n)===123){n++,i();for(var o=[];l.charCodeAt(n)!==125;){if((r=g(v))==null||(i(),l.charCodeAt(n++)!==58))throw d("ObjectField");i(),o.push({kind:"ObjectField",name:{kind:"Name",value:r},value:A(e)})}return n++,i(),{kind:"ObjectValue",fields:o}}else if((t=D.exec(l))!=null){if(n=D.lastIndex,i(),(r=t[S.Const])!=null)return r==="null"?{kind:"NullValue"}:{kind:"BooleanValue",value:r==="true"};if((r=t[S.Var])!=null){if(e)throw d("Variable");return{kind:"Variable",name:{kind:"Name",value:r}}}else if((r=t[S.Int])!=null){var u;return(u=t[S.Float])!=null?{kind:"FloatValue",value:r+u}:{kind:"IntValue",value:r}}else{if((r=t[S.BlockString])!=null)return{kind:"StringValue",value:q(r.slice(3,-3)),block:!0};if((r=t[S.String])!=null)return{kind:"StringValue",value:M.test(r)?JSON.parse(r):r.slice(1,-1),block:!1};if((r=t[S.Enum])!=null)return{kind:"EnumValue",value:r}}}throw d("Value")}function _(e){if(l.charCodeAt(n)===40){var r=[];n++,i();var t;do{if((t=g(v))==null||(i(),l.charCodeAt(n++)!==58))throw d("Argument");i(),r.push({kind:"Argument",name:{kind:"Name",value:t},value:A(e)})}while(l.charCodeAt(n)!==41);return n++,i(),r}}function I(e){if(l.charCodeAt(n)===64){var r=[],t;do{if(n++,(t=g(v))==null)throw d("Directive");i(),r.push({kind:"Directive",name:{kind:"Name",value:t},arguments:_(e)})}while(l.charCodeAt(n)===64);return r}}function j(){for(var e,r=0;l.charCodeAt(n)===91;)r++,n++,i();if((e=g(v))==null)throw d("NamedType");i();var t={kind:"NamedType",name:{kind:"Name",value:e}};do if(l.charCodeAt(n)===33&&(n++,i(),t={kind:"NonNullType",type:t}),r){if(l.charCodeAt(n++)!==93)throw d("NamedType");i(),t={kind:"ListType",type:t}}while(r--);return t}var E=new RegExp("(?:(\\.{3})|("+v.source+"))","y"),V=function(e){return e[e.Spread=1]="Spread",e[e.Name=2]="Name",e}(V||{});function C(){var e=[],r,t;do if(E.lastIndex=n,(t=E.exec(l))!=null){if(n=E.lastIndex,t[V.Spread]!=null){i();var a=g(v);if(a!=null&&a!=="on")i(),e.push({kind:"FragmentSpread",name:{kind:"Name",value:a},directives:I(!1)});else{if(i(),a==="on"){if((a=g(v))==null)throw d("NamedType");i()}var o=I(!1);if(l.charCodeAt(n++)!==123)throw d("InlineFragment");i(),e.push({kind:"InlineFragment",typeCondition:a?{kind:"NamedType",name:{kind:"Name",value:a}}:void 0,directives:o,selectionSet:C()})}}else if((r=t[V.Name])!=null){var u=void 0;if(i(),l.charCodeAt(n)===58){if(n++,i(),u=r,(r=g(v))==null)throw d("Field");i()}var s=_(!1);i();var h=I(!1),f=void 0;l.charCodeAt(n)===123&&(n++,i(),f=C()),e.push({kind:"Field",alias:u?{kind:"Name",value:u}:void 0,name:{kind:"Name",value:r},arguments:s,directives:h,selectionSet:f})}}else throw d("SelectionSet");while(l.charCodeAt(n)!==125);return n++,i(),{kind:"SelectionSet",selections:e}}function G(){var e,r;if((e=g(v))==null||(i(),g(v)!=="on")||(i(),(r=g(v))==null))throw d("FragmentDefinition");i();var t=I(!1);if(l.charCodeAt(n++)!==123)throw d("FragmentDefinition");return i(),{kind:"FragmentDefinition",name:{kind:"Name",value:e},typeCondition:{kind:"NamedType",name:{kind:"Name",value:r}},directives:t,selectionSet:C()}}var z=/(?:query|mutation|subscription|fragment)/y;function U(e){var r,t,a;if(e&&(i(),r=g(v),t=function(){if(i(),l.charCodeAt(n)===40){var u=[];n++,i();var s;do{if(l.charCodeAt(n++)!==36||(s=g(v))==null)throw d("Variable");if(i(),l.charCodeAt(n++)!==58)throw d("VariableDefinition");i();var h=j(),f=void 0;l.charCodeAt(n)===61&&(n++,i(),f=A(!0)),i(),u.push({kind:"VariableDefinition",variable:{kind:"Variable",name:{kind:"Name",value:s}},type:h,defaultValue:f,directives:I(!0)})}while(l.charCodeAt(n)!==41);return n++,i(),u}}(),a=I(!1)),l.charCodeAt(n)===123)return n++,i(),{kind:"OperationDefinition",operation:e||"query",name:r?{kind:"Name",value:r}:void 0,variableDefinitions:t,directives:a,selectionSet:C()}}function J(e,r){return l=typeof e.body=="string"?e.body:e,n=0,function(){var a,o;i();var u=[];do if((a=g(z))==="fragment")i(),u.push(G());else if((o=U(a))!=null)u.push(o);else throw d("Document");while(n<l.length);return{kind:"Document",definitions:u}}()}function m(e,r,t){for(var a="",o=0;o<e.length;o++)o&&(a+=r),a+=t(e[o]);return a}function Q(e){return JSON.stringify(e)}function Y(e){return`"""
`+e.replace(/"""/g,'\\"""')+`
"""`}var p=`
`,c={OperationDefinition(e){var r=e.operation;return e.name&&(r+=" "+e.name.value),e.variableDefinitions&&e.variableDefinitions.length&&(e.name||(r+=" "),r+="("+m(e.variableDefinitions,", ",c.VariableDefinition)+")"),e.directives&&e.directives.length&&(r+=" "+m(e.directives," ",c.Directive)),r!=="query"?r+" "+c.SelectionSet(e.selectionSet):c.SelectionSet(e.selectionSet)},VariableDefinition(e){var r=c.Variable(e.variable)+": "+y(e.type);return e.defaultValue&&(r+=" = "+y(e.defaultValue)),e.directives&&e.directives.length&&(r+=" "+m(e.directives," ",c.Directive)),r},Field(e){var r=e.alias?e.alias.value+": "+e.name.value:e.name.value;if(e.arguments&&e.arguments.length){var t=m(e.arguments,", ",c.Argument);r.length+t.length+2>80?r+="("+(p+="  ")+m(e.arguments,p,c.Argument)+(p=p.slice(0,-2))+")":r+="("+t+")"}return e.directives&&e.directives.length&&(r+=" "+m(e.directives," ",c.Directive)),e.selectionSet&&(r+=" "+c.SelectionSet(e.selectionSet)),r},StringValue(e){return e.block?Y(e.value).replace(/\n/g,p):Q(e.value)},BooleanValue:e=>""+e.value,NullValue:e=>"null",IntValue:e=>e.value,FloatValue:e=>e.value,EnumValue:e=>e.value,Name:e=>e.value,Variable:e=>"$"+e.name.value,ListValue:e=>"["+m(e.values,", ",y)+"]",ObjectValue:e=>"{"+m(e.fields,", ",c.ObjectField)+"}",ObjectField:e=>e.name.value+": "+y(e.value),Document(e){return!e.definitions||!e.definitions.length?"":m(e.definitions,`

`,y)},SelectionSet:e=>"{"+(p+="  ")+m(e.selections,p,y)+(p=p.slice(0,-2))+"}",Argument:e=>e.name.value+": "+y(e.value),FragmentSpread(e){var r="..."+e.name.value;return e.directives&&e.directives.length&&(r+=" "+m(e.directives," ",c.Directive)),r},InlineFragment(e){var r="...";return e.typeCondition&&(r+=" on "+e.typeCondition.name.value),e.directives&&e.directives.length&&(r+=" "+m(e.directives," ",c.Directive)),r+=" "+c.SelectionSet(e.selectionSet)},FragmentDefinition(e){var r="fragment "+e.name.value;return r+=" on "+e.typeCondition.name.value,e.directives&&e.directives.length&&(r+=" "+m(e.directives," ",c.Directive)),r+" "+c.SelectionSet(e.selectionSet)},Directive(e){var r="@"+e.name.value;return e.arguments&&e.arguments.length&&(r+="("+m(e.arguments,", ",c.Argument)+")"),r},NamedType:e=>e.name.value,ListType:e=>"["+y(e.type)+"]",NonNullType:e=>y(e.type)+"!"},y=e=>c[e.kind](e);function W(e){return p=`
`,c[e.kind]?c[e.kind](e):""}var T=(e,r)=>{for(var t=0|(r||5381),a=0,o=0|e.length;a<o;a++)t=(t<<5)+t+e.charCodeAt(a);return t},Z=/("{3}[\s\S]*"{3}|"(?:\\.|[^"])*")/g,H=/(?:#[^\n\r]+)?(?:[\r\n]+|$)/g,K=(e,r)=>r%2==0?e.replace(H,`
`):e,O=e=>e.split(Z).map(K).join("").trim(),x=new Map,b=new Map,w=e=>{var r;return typeof e=="string"?r=O(e):e.loc&&b.get(e.__key)===e?r=e.loc.source.body:(r=x.get(e)||O(W(e)),x.set(e,r)),typeof e!="string"&&!e.loc&&(e.loc={start:0,end:r.length,source:{body:r,name:"gql",locationOffset:{line:1,column:1}}}),r},L=e=>{var r;if(e.documentId)r=T(e.documentId);else if(r=T(w(e)),e.definitions){var t=X(e);t&&(r=T(`
# ${t}`,r))}return r},P=e=>{var r,t;return typeof e=="string"?(r=L(e),t=b.get(r)||J(e)):(r=e.__key||L(e),t=b.get(r)||e),t.loc||w(t),t.__key=r,b.set(r,t),t},X=e=>{for(var r of e.definitions)if(r.kind===F.OPERATION_DEFINITION)return r.name?r.name.value:void 0};typeof TextDecoder<"u"&&new TextDecoder;function $(e){for(var r=new Map,t=[],a=[],o=Array.isArray(e)?e[0]:e||"",u=1;u<arguments.length;u++){var s=arguments[u];s&&s.definitions?a.push(s):o+=s,o+=arguments[0][u]}a.unshift(P(o));for(var h of a)for(var f of h.definitions)if(f.kind===F.FRAGMENT_DEFINITION){var N=f.name.value,B=w(f);r.has(N)||(r.set(N,B),t.push(f))}else t.push(f);return P({kind:F.DOCUMENT,definitions:t})}$`
	query ProductsList(
		$filter: ProductFilterInput
		$where: ProductWhereInput
		$sortBy: ProductOrder
		$search: String
		$channel: String
		$before: String
		$after: String
		$first: Int
		$last: Int
	) {
		products(
			filter: $filter
			where: $where
			sortBy: $sortBy
			search: $search
			channel: $channel
			before: $before
			after: $after
			first: $first
			last: $last
		) {
			pageInfo {
				startCursor
				endCursor
				hasPreviousPage
				hasNextPage
			}
			edges {
				cursor
				node {
					id
					name
					slug
					description
					created
					updatedAt
				}
			}
		}
	}
`;const ee=$`
	query Categories(
		$filter: CategoryFilterInput
		$where: CategoryWhereInput
		$sortBy: CategorySortingInput
		$level: Int
		$first: Int
		$last: Int
		$before: String
		$after: String
		$backgroundSize: Int
		$backgroundFormat: ThumbnailFormatEnum
	) {
		categories(
			filter: $filter
			where: $where
			sortBy: $sortBy
			level: $level
			first: $first
			last: $last
			before: $before
			after: $after
		) {
			pageInfo {
				startCursor
				endCursor
				hasPreviousPage
				hasNextPage
			}
			edges {
				cursor
				node {
					id
					name
					slug
					backgroundImage(size: $backgroundSize, format: $backgroundFormat) {
						url
						alt
					}
				}
			}
		}
	}
`;$`
	query Category(
		$slug: String
		$id: ID
		$backgroundSize: Int = 250
		$imageFormat: ThumbnailFormatEnum = WEBP
		$firstNumOfChildren: Int = 10
		$lastNumOfChildren: Int = 10
		$before: String
		$after: String
	) {
		category(slug: $slug, id: $id) {
			id
			name
			description
			backgroundImage(size: $backgroundSize, format: $imageFormat) {
				url
				alt
			}
			children(
				first: $firstNumOfChildren
				last: $lastNumOfChildren
				before: $before
				after: $after
			) {
				totalCount
				edges {
					node {
						id
						name
						slug
					}
				}
				pageInfo {
					startCursor
					endCursor
					hasPreviousPage
					hasNextPage
				}
			}
		}
	}
`;$`
	query Product($slug: String!, $channel: String!) {
		product(slug: $slug, channel: $channel) {
			id
			name
			slug
			description
			rating
			created
			updatedAt
			isAvailableForPurchase
			weight {
				unit
				value
			}
			media {
				url
				alt
				type
				oembedData
				id
			}
			attributes {
				attribute {
					id
					name
					slug
					type
					unit
					inputType
				}
				values {
					id
					name
					value
					slug
					boolean
					date
					dateTime
					richText
					plainText
				}
			}
			defaultVariant {
				id
				name
			}
			variants {
				id
			}
			pricing {
				onSale
				displayGrossPrices
				discount {
					tax {
						amount
						currency
					}
					net {
						amount
						currency
					}
					gross {
						amount
						currency
					}
					currency
				}
				priceRange {
					start {
						currency
						gross {
							amount
							currency
						}
						net {
							amount
							currency
						}
					}
					stop {
						currency
						gross {
							amount
							currency
						}
						net {
							amount
							currency
						}
					}
				}
			}
		}
	}
`;$`
	query ProductVariants($ids: [ID!]!, $channel: String!, $first: Int!) {
		productVariants(channel: $channel, ids: $ids, first: $first) {
			edges {
				node {
					id
					name
					sku
					trackInventory
					quantityLimitPerCustomer
					quantityAvailable
					margin
					quantityOrdered
					media {
						url
						alt
						id
					}
					attributes(variantSelection: ALL) {
						attribute {
							slug
							name
							entityType
						}
						values {
							id
							name
							value
							plainText
							boolean
						}
					}
				}
			}
		}
	}
`;export{ee as C};
