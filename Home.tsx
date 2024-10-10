import * as React from 'react';
import { Alert, FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { API_URL } from './constants';

interface ListItem {
	item: (typeof data)[0];
}

const ListItem: React.VFC<ListItem> = React.memo(({ item }) => {
	return (
		<View>
			<Image source={{ uri: item.previewURL }} style={styles.image} resizeMode="contain" />
		</View>
	);
});

ListItem.displayName = 'sdfsd';

interface ListItemText {
	item: string;
}
const ListItemText: React.VFC<ListItem> = React.memo(({ item }) => {
	return (
		<View>
			<Pressable onPress={() => {}}>
				<Text>{item}</Text>
			</Pressable>
		</View>
	);
});

ListItemText.displayName = 'sdfsd';

const Home = () => {
	const [apiData, setApiData] = React.useState([]);
	const [searchQueryData, setSearchQueryData] = React.useState([]);
	const [showQueryData, setShowQueryData] = React.useState([]);
	const [searchText, setText] = React.useState('');
	const currPage = React.useRef(1);
	const timerRef = React.useRef<NodeJS.Timeout | null>(null);

	const fetchData = React.useCallback(
		(cb: (data: any) => void, failCb: () => void) => {
			const networkCall = () => {
				const REFINED_URL = `${API_URL}&q=${searchText}&page=${currPage.current}`;
				console.log('API call made', REFINED_URL);
				fetch(REFINED_URL)
					.then(res => res.json())
					.then(resp => {
						cb(resp);
					})
					.catch(() => {
						console.log('error occured');
						failCb?.();
					});
			};

			clearTimeout(timerRef?.current ?? undefined);
			timerRef.current = setTimeout(() => {
				networkCall();
			}, 1000);
		},
		[searchText],
	);

	const refreshData = () => {
		console.log('fetch nex set of dta');
		currPage.current++;
		fetchData(
			resp => {
				// fix types later
				console.log('recieved data', resp?.hits.length);
				setApiData(prev => prev.concat(resp?.hits));
				// update search
				updateSearchQuery();
			},
			() => {
				Alert.alert('Data fetch failed');
			},
		);
	};

	const onTextChange = data => {
		console.log('sea', data);
		setText(data);
	};

	const updateSearchQuery = () => {
		if (searchText in searchQueryData) {
			// do nothing
		} else {
			setSearchQueryData(prev => {
				const newData = [searchText, ...prev];
				return newData.slice(0, 10);
			});
		}
	};

	React.useEffect(() => {
		//reset
		currPage.current = 1;

		// call api
		fetchData(
			resp => {
				setApiData(resp?.hits);
				// update my search query data
				updateSearchQuery();
			},
			() => {
				Alert.alert('Data fetch failed');
			},
		);
	}, [searchText, fetchData]);

	const handleFocus = () => {
		setShowQueryData(true);
	};

	return (
		<SafeAreaView>
			<View style={styles.screen}>
				<TextInput style={styles.input} onChangeText={onTextChange} onFocus={handleFocus} />
				<FlatList
					data={searchQueryData}
					keyExtractor={val => val?.id}
					renderItem={({ item }) => <ListItemText item={item} />}
				/>
				<FlatList
					data={apiData}
					keyExtractor={val => val?.id}
					renderItem={({ item }) => <ListItem item={item} />}
					onEndReached={refreshData}
					onEndReachedThreshold={0.1}
				/>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	screen: {
		padding: 16,
	},
	input: {
		borderColor: 'black',
		borderWidth: 2,
		padding: 16,
	},
	image: { height: 200 },
});

export default Home;
