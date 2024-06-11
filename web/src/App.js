import { useState } from "react";
import Task from "./_components/Task";
import {
	AnimatePresence,
	AnimateSharedLayout,
	motion,
	Reorder,
} from "framer-motion/dist/framer-motion";
import Wrap from "./_components/Wrap";
import Header from "./_components/Header";
import Input from "./_components/Input";
import Empty from "./_components/Empty";
import SubHeader from "./_components/SubHeader";
import { gql, useMutation, useQuery } from "@apollo/client";
import Spin from "./_components/Spin";
import cls from "./_util/cls";

export default function App() {
	const [hasFocus, setHasFocus] = useState(false),
		[busy, setBusy] = useState(false);

	const { data, loading, error, refetch } = useQuery(gql`
		query {
			active: tasks(
				filter: { complete: { equalTo: false } }
				orderBy: [DUE_DATE_ASC, CREATED_AT_ASC]
			) {
				nodes {
					...Task
					createdAt
					dueDate
				}
			}
			complete: tasks(
				filter: { complete: { equalTo: true } }
				orderBy: [COMPLETED_AT_ASC]
			) {
				nodes {
					...Task
				}
			}
		}
		fragment Task on Task {
			id
			text
			complete
		}
	`);

	const [create] = useMutation(gql`
		mutation Create($text: String!, $dueDate: Datetime) {
			createTask(input: { task: { text: $text, dueDate: $dueDate } }) {
				clientMutationId
			}
		}
	`);

	const [complete] = useMutation(gql`
		mutation Complete($id: UUID!) {
			complete(input: { id: $id }) {
				clientMutationId
			}
		}
	`);

	const [uncomplete] = useMutation(gql`
		mutation Uncomplete($id: UUID!) {
			uncomplete(input: { id: $id }) {
				clientMutationId
			}
		}
	`);

	const onSubmit = async (text, dueDate) => {
		setBusy(true);
		await create({
			variables: { text, dueDate },
			optimisticResponse: {
				__typename: "Mutation",
				createTask: {
					__typename: "Task",
					id: Math.random(),
					text,
					complete: false,
					createdAt: Date.now(),
					dueDate: dueDate,
				},
			},
		});

		await refetch();
		setBusy(false);
	};

	const renderTask = (t) => (
		<Task
			key={t.id}
			text={t.text}
			dueDate={t.dueDate}
			complete={t.complete}
			onChange={async (checked) => {
				setBusy(true);
				if (checked) {
					await complete({
						variables: { id: t.id },
						optimisticResponse: {
							__typename: "Mutation",
							complete: {
								...t,
								__typename: "Task",
								complete: true,
							},
						},
					});
				} else {
					await uncomplete({
						variables: { id: t.id },
						optimisticResponse: {
							__typename: "Mutation",
							uncomplete: {
								...t,
								__typename: "Task",
								complete: false,
							},
						},
					});
				}

				await refetch();
				setBusy(false);
			}}
			layoutId={t.id}
		/>
	);

	const reOrderTask = (tasks) => {
		console.log(tasks);
	};

	const activeTasks = data && data.active ? data.active.nodes : [],
		completeTasks = data && data.complete ? data.complete.nodes : [];

	const hasTasks = activeTasks.length + completeTasks.length > 0;

	return (
		<Wrap>
			<Spin show={loading || busy} />
			<Header>
				<h1>Launch Checklist</h1>
				<p>List of pre-launch tasks for my big project.</p>
			</Header>

			<Input onSubmit={onSubmit} onFocusChange={setHasFocus} />

			<AnimatePresence>
				{error && (
					<Empty error>
						<p>🤬 {error.message}</p>
					</Empty>
				)}
			</AnimatePresence>

			<AnimateSharedLayout>
				<motion.div
					animate={hasFocus ? "from" : "to"}
					variants={{
						from: { opacity: 0.4 },
						to: { opacity: 1 },
					}}
				>
					<AnimatePresence>
						{!hasTasks && (
							<Empty>
								<p>😲 You haven't added any tasks!</p>
							</Empty>
						)}
					</AnimatePresence>

					<AnimatePresence>
						{hasTasks && activeTasks.length === 0 && (
							<Empty>
								<p>🎉 You've completed all your tasks!</p>
							</Empty>
						)}
					</AnimatePresence>

					<Reorder.Group values={activeTasks} onReorder={reOrderTask}>
						{activeTasks.map((e) => {
							return (
								<Reorder.Item
									value={e}
									className={cls("listItem")}
								>
									{renderTask(e)}
								</Reorder.Item>
							);
						})}
					</Reorder.Group>

					<AnimatePresence>
						{hasTasks && <SubHeader>Completed Tasks</SubHeader>}
					</AnimatePresence>
					{completeTasks.map(renderTask)}
					<AnimatePresence>
						{hasTasks && completeTasks.length === 0 && (
							<Empty>
								<p>🏃 Better get going!</p>
							</Empty>
						)}
					</AnimatePresence>
				</motion.div>
			</AnimateSharedLayout>
		</Wrap>
	);
}
